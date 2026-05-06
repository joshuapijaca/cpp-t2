// Build-time card generator. Outline → AI → cards.json.
// Anchored: AI cannot author atom IDs, deps, levels, or Q-tags.
// Spec: ../docs/08_outline_spec.md, ../docs/11_build_outline.md, ../ANTIPATTERNS.md #5.
//
// Run: npm run gen
// Requires: ANTHROPIC_API_KEY env var.

import Anthropic from '@anthropic-ai/sdk';
import yaml from 'js-yaml';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import { createHash } from 'crypto';
import { dirname, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const OUTLINE_GLOB = 'outlines/**/*.yml';
const OUT_PATH = 'data/cards.json';
const MODEL = 'claude-opus-4-7';

interface OutlineSourceRef {
  quote_id?: string;
  file_path?: string;
  verbatim_summary?: string;
  note?: string;
  code_example?: string;
}

interface Outline {
  id: string;
  fact: string;
  words: number;
  level: number;
  deps: string[];
  q_tags: { Q1: 'C' | 'S' | 'N'; Q2: 'C' | 'S' | 'N'; Q3: 'C' | 'S' | 'N'; Q4: 'C' | 'S' | 'N' };
  pfg_source: OutlineSourceRef[];
  test2_evidence?: { question?: string; instance?: string; file_path?: string }[];
  canonical_example?: string;
  expected_output?: string;
  sit102_quirks?: string[];
  misconceptions?: { id: string; description: string; student_says: string; correct_says: string }[];
  render_hints?: {
    memorize_seed_phrases?: string[];
    trace?: { description?: string; minimum_steps?: number; must_show?: string[] };
    write_L1_fill?: { template?: string; blank_value?: string };
    write_L2_complete?: { template?: string; blank_value?: string };
    write_L3_free_spec?: string;
  };
  acceptance?: {
    memorize?: string[];
    mcq?: string[];
    trace?: string[];
    write?: string[];
    cross_card?: string[];
  };
  lint?: {
    forbid_tokens?: string[];
    require_at_least_one_of_in_write_L3?: string[];
    miller_max_words?: number;
  };
  status: 'draft' | 'locked' | 'revision-pending';
}

interface MemorizeCardOut {
  type: 'memorize';
  atomId: string;
  fact: string;
  flashSeconds: number;
  mode: 'race' | 'recall';
  keyChecks: string[];
  explanation: string;
}

type CardOut = MemorizeCardOut;

const client = new Anthropic();

function loadOutlines(): Outline[] {
  const files = glob.sync(OUTLINE_GLOB, { cwd: ROOT });
  return files
    .map((f) => yaml.load(readFileSync(resolve(ROOT, f), 'utf8')) as Outline)
    .filter((o) => o && o.status === 'locked');
}

function memorizePrompt(o: Outline): { system: string; user: string } {
  const seeds = o.render_hints?.memorize_seed_phrases ?? [o.fact];
  const acceptance = o.acceptance?.memorize ?? [];
  const forbid = o.lint?.forbid_tokens ?? [];
  const millerMax = o.lint?.miller_max_words ?? 7;
  const explanationTone = o.misconceptions?.[0]?.correct_says ?? '';

  return {
    system: `You generate memorize cards for the cpp-t2 learning app. ANCHOR: every card must satisfy the outline's acceptance criteria and lint rules. NEVER drift from the seed phrases. NEVER exceed ${millerMax} words per fact. NEVER use forbidden tokens.`,
    user: `Outline:
- atom: ${o.id}
- fact: ${o.fact}
- seed phrases (use these verbatim or near-verbatim):
${seeds.map((s) => `  - "${s}"`).join('\n')}
- acceptance:
${acceptance.map((a) => `  - ${a}`).join('\n')}
- forbidden tokens: ${forbid.join(', ') || '(none)'}
- miller max words: ${millerMax}
- correct framing: ${explanationTone}

Produce 5 memorize-card variants as JSON array. Each item:
{
  "fact": "<≤${millerMax}-word phrase>",
  "keyChecks": ["<token1>", "<token2>", ...],
  "explanation": "<2-4 sentence explanation; precise; references caller/parameter/aliasing as appropriate>"
}

Use the 5 seed phrases as the 5 facts (one each). For each, choose 2-4 keyChecks tokens (lowercase, must be substrings of fact when normalized to lowercase + collapsed whitespace; tokens that distinguish this variant from others). Explanation should be one consistent paragraph per atom — same explanation for all 5 cards is acceptable.

Output JSON only. No prose. No markdown.`,
  };
}

async function generateMemorize(o: Outline): Promise<MemorizeCardOut[]> {
  const { system, user } = memorizePrompt(o);
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: user }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`No JSON array in response for ${o.id}`);
  const arr = JSON.parse(match[0]) as Array<{ fact: string; keyChecks: string[]; explanation: string }>;

  return arr.map((c) => ({
    type: 'memorize' as const,
    atomId: o.id,
    fact: c.fact,
    flashSeconds: 3,
    mode: 'recall' as const,
    keyChecks: c.keyChecks,
    explanation: c.explanation,
  }));
}

function dedupByHash<T extends { atomId: string; fact?: string; spec?: string }>(cards: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const c of cards) {
    const key = createHash('sha256').update(JSON.stringify(c)).digest('hex');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

async function main() {
  const outlines = loadOutlines();
  console.log(`Loaded ${outlines.length} locked outlines.`);

  const all: CardOut[] = [];
  for (const o of outlines) {
    console.log(`Generating for ${o.id} (level ${o.level})...`);
    const cards = await generateMemorize(o);
    all.push(...cards);
  }

  const unique = dedupByHash(all);
  console.log(`Generated ${all.length} cards (${unique.length} after dedup).`);

  const outAbs = resolve(ROOT, OUT_PATH);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, JSON.stringify(unique, null, 2));
  console.log(`Wrote ${unique.length} cards to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
