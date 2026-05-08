# Terminal Epistemology: Blank Slate → Test 2 Mastery

**What this document is**: A brute-force recursive WHY/HOW decomposition of every piece of knowledge required to go from "leaves all 4 answers blank" to "writes all 4 answers perfectly." Every question asked until bedrock. Then the bridge: how a linear, card-only app (no video, no live API) closes every gap.

**Source paper**: SIT102 Test 2 V2.0, sat 2026-05-07. Two pages. Four questions. Result: Redo (all blank).

**Constraint**: The app can only use text + code + interactive cards. No video. No live API. No AI at runtime. Linear sequence — walk forward, card by card. The CONTENT must be so comprehensive that mastery is structurally inevitable.

**Core thesis**: Every card is a WHY→HOW unit. Every atom answers one terminal question. Input → WHY this matters → HOW it works → Output (produce/recall/trace). ~4,000 cards. Hand-authored. Bulletproof.

---

# PART 1 — TERMINAL WHY: ZERO STATE

"Why does a blank slate leave all 4 answers blank after 90 minutes?"

We ask WHY recursively for each question until we hit bedrock — the atomic knowledge unit that cannot be decomposed further. Each bedrock is tagged with its epistemological type.

## Epistemological type key

| Code | Type | What it means |
|---|---|---|
| LEX | Lexical | Token → meaning mapping |
| SYN | Syntactic | Grammar rules, valid forms |
| SEM | Semantic | What code DOES when it runs |
| PROC | Procedural | Step-by-step HOW to do a task |
| DISC | Discriminative | Telling similar things apart |
| COMP | Compositional | Combining multiple operations |
| GEN | Generative | Cold-producing code from nothing |
| PAT | Pattern | Recognizing algorithm shapes |
| META | Metacognitive | Knowing about your own knowing |
| NEG | Negative | Knowing what something is NOT |
| REL | Relational | How parts connect across questions |
| TEMP | Temporal | When things happen in execution order |
| COUNTER | Counterfactual | What would happen IF you did it differently |
| SPAT | Spatial | Where data flows, direction of operations |

---

## 1.1 — Q1 ZERO STATE: "Hand execute the code"

The student sees:

```cpp
const int SIZE = 5;
struct stat_double {
  double numbers[SIZE];
  double mystery;
};
void who_am_i(stat_double &data) {
  int i;
  data.mystery = 0.0;
  for (i = 0; i < SIZE; i++) {
    if (data.numbers[i] > 0) {
      data.mystery = data.mystery + data.numbers[i];
    }
  }
}
// Initialise d.numbers with {2.4, -3.7, -1.7, 3.0, 2.0}
// and d.mystery with -0.9.
stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9};
who_am_i(d);
```

Instruction: "Hand execute the code below using this procedure."

### WHY is Q1 blank?

```
WHY can't they answer Q1?
→ They can't produce a trace table with variable states per iteration

  WHY can't they produce a trace table?
  → They don't know what a trace table IS
  
    WHY don't they know what a trace table is?
    → They've never been shown the FORMAT of a trace deliverable
    
      WHY does the format matter?
      → Without knowing WHAT to write, they can't start writing
      
        ★ BEDROCK Q1-B01 [PROC]: "Hand execute = draw a column per variable,
          a row per step, update values as each line runs, report final state"
          
          WHY is this the bedrock?
          → This is the TASK DEFINITION. Everything else follows from knowing
            what the task IS. You cannot execute a procedure you cannot define.

  WHY can't they trace even if they knew the format?
  → They can't READ the code
  
    WHY can't they read the code?
    → Every token is meaningless noise
    
      WHY is every token meaningless?
      → No lexical decoder installed — no mapping from symbol → meaning
      
        WHY do they need a lexical decoder?
        → C++ is not natural language. Each symbol has a precise technical 
          meaning that differs from English intuition.
          
          ★ BEDROCK Q1-B02 [META]: "C++ looks like English but is NOT English.
            Every token has a precise meaning that must be explicitly learned.
            You cannot infer it from context like you would in conversation."
            
      → Decomposing further: WHICH tokens are unknown?
      
        WHY don't they know `const`?
        → Never mapped this keyword to "locked value, cannot reassign"
          ★ BEDROCK Q1-B03 [LEX]: "const = value frozen at initialization"
          
        WHY don't they know `int`?
        → Never mapped to "whole number type"
          ★ BEDROCK Q1-B04 [LEX]: "int = whole numbers: 5, -3, 0. No decimal."
          
        WHY don't they know `SIZE`?
        → Can't distinguish PROGRAMMER NAME from KEYWORD
          ★ BEDROCK Q1-B05 [DISC]: "UPPER_CASE = programmer-chosen constant name.
            Lowercase reserved words (int, void, struct) = keywords."
            
        WHY don't they know what `= 5` does?
        → They think `=` means "is equal to" (math training, 18 years)
          ★ BEDROCK Q1-B06 [NEG]: "= is NOT equality. It is ASSIGNMENT.
            Store right side INTO left side. Destroys old value."
          ★ BEDROCK Q1-B07 [SEM]: "Right side computed FIRST using current values.
            Result stored into left side SECOND. Direction: right → left."
            
        WHY don't they know `;`?
        → Semicolons are stylistic in English; mandatory terminators in C++
          ★ BEDROCK Q1-B08 [SYN]: "; ends every statement. Missing = compile error."
          
        WHY don't they know `struct`?
        → No concept of user-defined compound types
        
          WHY do they need this concept?
          → stat_double IS a struct. Can't read Q1 without knowing what it defines.
          
            WHY can't they understand struct from context?
            → "struct" followed by a name followed by `{fields};` is a DEFINITION pattern
              that must be learned explicitly
              
              ★ BEDROCK Q1-B09 [SYN]: "struct NAME { TYPE field; TYPE field; };"
              ★ BEDROCK Q1-B10 [SEM]: "struct = bundle multiple values under one name.
                Like a form with labeled fields. Creates a NEW TYPE."
                
        WHY don't they know `stat_double`?
        → Looks like it could be a keyword but it's programmer-chosen
        
          WHY does this confusion matter?
          → If they think it's a system type they'll look for "documentation"
            instead of reading the struct definition RIGHT ABOVE
            
            ★ BEDROCK Q1-B11 [DISC]: "Names you don't recognize in code are
              PROGRAMMER-CHOSEN. Read the surrounding code to find their definition."
              
        WHY don't they know `double`?
          ★ BEDROCK Q1-B12 [LEX]: "double = decimal number: 3.14, -0.9, 0.0"
          
        WHY don't they know `numbers[SIZE]`?
        → Two unknown concepts combined: arrays AND subscript notation
        
          WHY don't they know arrays?
            ★ BEDROCK Q1-B13 [SEM]: "array = numbered row of boxes, all same type.
              One name, many values. Accessed by index number in [brackets]."
              
          WHY don't they know `[SIZE]` in declaration means "5 elements"?
            ★ BEDROCK Q1-B14 [SYN]: "TYPE name[N] in declaration = array of N elements"
            
          WHY don't they know indexing starts at 0?
            ★ BEDROCK Q1-B15 [SEM]: "First element is [0]. Last is [N-1].
              numbers[0] through numbers[4] for SIZE=5."
              
        WHY don't they know `mystery`?
        → Programmer-chosen field name (same class as stat_double)
          → Covered by Q1-B11
          
        WHY don't they know `};` after the struct?
        → `}` ends code blocks. `};` ends struct definitions. Look the same.
          ★ BEDROCK Q1-B16 [DISC]: "} alone = end of code block.
            }; = end of struct DEFINITION. The ; is mandatory, most-forgotten char."
            
        WHY don't they know `void`?
          ★ BEDROCK Q1-B17 [LEX]: "void = function returns nothing.
            Does work (side effects) but gives back no value."
            
        WHY don't they know `who_am_i(...)`?
        → Don't know what a FUNCTION is
        
          WHY do they need to know functions?
          → Q1's entire computation happens INSIDE a function call
          
            ★ BEDROCK Q1-B18 [SEM]: "function = named block of reusable code.
              Defined once, called by name. Takes inputs via parameters."
            ★ BEDROCK Q1-B19 [PROC]: "calling a function = pause current line,
              jump INTO function body, run it line by line, jump BACK when done."
              
        WHY don't they know `(stat_double &data)`?
        → Three concepts compressed into one expression
        
          WHY don't they know parameters?
            ★ BEDROCK Q1-B20 [SEM]: "parameter = named input slot.
              When function is called, argument value fills the slot."
              
          WHY don't they know `&`?
          → `&` has 3 meanings in C++. Here: reference parameter.
          
            WHY does the `&` meaning matter for Q1?
            → WITH &: `data` IS `d`. Same memory. Changes to data.mystery
              change d.mystery. WITHOUT &: function modifies a copy, d unchanged.
              
              ★ BEDROCK Q1-B21 [SEM]: "& in parameter list = reference = ALIAS.
                Two names (data inside function, d outside), ONE storage location.
                Modify one → the other changes too."
              ★ BEDROCK Q1-B22 [COUNTER]: "WITHOUT &: function gets a COPY.
                All modifications die when function returns. Caller's variable unchanged."
              ★ BEDROCK Q1-B23 [DISC]: "& appears in DEFINITION only.
                At call site: who_am_i(d) — NO & when calling."
                
        WHY don't they know `int i;`?
          ★ BEDROCK Q1-B24 [SEM]: "declaration without = : box created,
            contents = GARBAGE. Must assign before reading."
            
        WHY don't they know `data.mystery = 0.0;`?
        → Three sub-concepts:
        
          WHY don't they know `.` (dot)?
            ★ BEDROCK Q1-B25 [SYN]: ". = reach inside struct, access named field.
              data.mystery = the mystery field inside data."
              
          WHY don't they know this OVERWRITES -0.9?
          → Assignment destroys previous value
          
            WHY is this the #1 trap?
            → d.mystery was initialized to -0.9 in the brace-init.
              This line REPLACES -0.9 with 0.0 BEFORE the loop starts.
              If forgotten: accumulation starts from -0.9, answer = 6.5 (WRONG).
              
              ★ BEDROCK Q1-B26 [SEM]: "assignment DESTROYS old value permanently.
                data.mystery was -0.9, now 0.0. The -0.9 is GONE FOREVER."
              ★ BEDROCK Q1-B27 [SEM]: "functions can OVERWRITE initialization values.
                Always trace what the function DOES to each field, not just what
                the initialization GAVE it."
                
        WHY don't they know `for (i = 0; i < SIZE; i++)`?
        → For-loop is FOUR concepts in one line
        
          ★ BEDROCK Q1-B28 [SYN]: "for (INIT; TEST; INCREMENT) { BODY }
            — four parts, fixed positions, semicolons separate first three."
          ★ BEDROCK Q1-B29 [PROC]: "Execution order:
            1. Run INIT once (i = 0)
            2. Check TEST. False → exit loop. True → continue.
            3. Run BODY.
            4. Run INCREMENT (i++).
            5. Go to step 2.
            Order: init → test → body → inc → test → body → inc → ... → test(false) → exit"
          ★ BEDROCK Q1-B30 [LEX]: "i++ = add 1 to i. Equivalent to i = i + 1."
          ★ BEDROCK Q1-B31 [SEM]: "i < SIZE produces true or false.
            true → loop continues. false → loop exits."
          ★ BEDROCK Q1-B32 [SEM]: "after loop exits, i = first FAILING value.
            for(i=0; i<5; i++) → after exit, i == 5 (not 4)."
            
        WHY don't they know `if (data.numbers[i] > 0)`?
        
          ★ BEDROCK Q1-B33 [SEM]: "if (condition) { body } = run body ONLY when
            condition is true. Skip body entirely when false."
          ★ BEDROCK Q1-B34 [COMP]: "data.numbers[i] = struct → field → index.
            Three operations chained: access struct data, find field numbers,
            get element at position i."
          ★ BEDROCK Q1-B35 [SEM]: "> 0 is STRICT greater-than. 0 > 0 = FALSE.
            Zero is NOT greater than zero."
          ★ BEDROCK Q1-B36 [PROC]: "when condition is false, SKIP entire body.
            Jump to line after closing }. Do NOT enter the body."
            
        WHY don't they know `data.mystery = data.mystery + data.numbers[i]`?
        
          ★ BEDROCK Q1-B37 [SEM]: "x = x + y : read OLD x, add y, store result
            BACK into x. This is the ACCUMULATOR pattern — running total."
          ★ BEDROCK Q1-B38 [SPAT]: "right side evaluated FIRST (using current values).
            Result stored into left side SECOND. Execution direction: right → left."
            
        WHY don't they know the brace initialization?
        `stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9};`
        
          ★ BEDROCK Q1-B39 [SYN]: "{ values } after = fills struct fields
            in DECLARATION ORDER. First slot → first field, second → second."
          ★ BEDROCK Q1-B40 [SYN]: "nested braces: outer { } = struct fields.
            Inner { } = array contents. { {array_vals}, scalar_val }"
          ★ BEDROCK Q1-B41 [SEM]: "result: d.numbers[0]=2.4, d.numbers[1]=-3.7,
            d.numbers[2]=-1.7, d.numbers[3]=3.0, d.numbers[4]=2.0, d.mystery=-0.9"
          ★ BEDROCK Q1-B42 [DISC]: "unary minus (-0.9) = negative literal, NOT subtraction.
            -0.9 is a single VALUE, not an operation."
            
        WHY don't they know `who_am_i(d);` is a function call?
        
          ★ BEDROCK Q1-B43 [SYN]: "name(arguments); = function call.
            Pause current line, jump into function body, run it, return."
          ★ BEDROCK Q1-B44 [SEM]: "at call: d fills the parameter data.
            Because of &, data IS d. Same storage."

  WHY can't they trace even if they understand each token?
  → Tracing requires PROCEDURAL knowledge — a step-by-step method
  
    WHY don't they have the method?
    → Never been shown the trace ALGORITHM
    
      ★ BEDROCK Q1-B45 [PROC]: "Trace algorithm:
        1. List all variables. Draw a box per variable.
        2. Initialize from declarations / brace-init.
        3. For each line (top to bottom):
           a. What CHANGES? Update the box.
           b. What OUTPUTS? Write to terminal area.
           c. Where does execution go NEXT?
        4. At end: report final values of all variables."
        
    WHY can't they track multiple variables at once?
    → Working memory overflow: 9+ items (5 array, mystery, i, condition, loop state)
    
      ★ BEDROCK Q1-B46 [META]: "Your brain holds ~7 items. This trace has 9+.
        The trace table IS your external brain. Offload to paper, not head."
        
    WHY can't they handle function calls during trace?
    → Control flow jumps to another location, then returns
    
      ★ BEDROCK Q1-B47 [PROC]: "When you hit a function call during trace:
        1. Draw a dividing line in your trace.
        2. Write: 'ENTERING function_name. parameter = argument.'
        3. Trace the function body.
        4. Write: 'RETURNING to caller.'
        5. Continue tracing from the line AFTER the call."
        
    WHY can't they handle loops during trace?
    → Same lines execute MULTIPLE TIMES with different values
    
      ★ BEDROCK Q1-B48 [PROC]: "Loop trace method:
        1. Write one ROW per iteration.
        2. Columns: iteration# | variable values | condition | action taken | state after
        3. Each row = the SAME code but DIFFERENT values.
        4. Final row: test fails, write EXIT."
        
  WHY might they get the WRONG answer even if they can trace?
  → Specific traps in Q1 V2.0
  
    ★ BEDROCK Q1-B49 [SEM]: "TRAP: init overwrite. d.mystery starts as -0.9
      but function sets data.mystery = 0.0 BEFORE the loop.
      Accumulation starts from 0.0. Answer: 7.4, NOT 6.5."
    ★ BEDROCK Q1-B50 [SEM]: "TRAP: strict comparison. > 0 excludes zero.
      If array contained 0, it would be SKIPPED (not added)."
    ★ BEDROCK Q1-B51 [SEM]: "TRAP: off-by-one. Loop runs 5 times (i=0..4).
      After exit i=5. Not 4, not 6."
    ★ BEDROCK Q1-B52 [PAT]: "Algorithm recognition: this code computes
      SUM OF POSITIVE VALUES. Pattern: result=0; for each: if >0, add.
      Positives in {2.4,-3.7,-1.7,3.0,2.0} = {2.4,3.0,2.0}. Sum = 7.4."
      
  WHY did they stare for 90 minutes instead of writing ANYTHING?
  
    ★ BEDROCK Q1-B53 [META]: "Perfectionism freeze: believing you must know
      the answer is correct before writing anything. WRONG strategy.
      On this exam: wrong > blank. Partial trace = partial marks. Blank = zero."
    ★ BEDROCK Q1-B54 [META]: "False proximity: code LOOKS like English,
      creating illusion of 'almost understanding.' Keeps you reading instead
      of admitting 'I don't know these symbols' and moving to Q2."

### Q1 BEDROCK COUNT: 54 terminal knowledge units

---

## 1.2 — Q2 ZERO STATE: "Write a data structure named desk_data"

The student sees:

```
You are creating a system for managing desks in an office. The following
fields are needed to represent a desk: (1) id of current user; (2) a desk id;
(3) number of screens.

2. Write a data structure named desk_data to capture these fields.
```

### WHY is Q2 blank?

```
WHY can't they answer Q2?
→ They can't write a struct from an English specification

  WHY can't they write a struct?
  → They don't know WHAT a struct is
    → Covered by Q1-B09, Q1-B10
    
  → They don't know the SYNTAX for writing one
  
    WHY don't they know the syntax?
    → Never memorized the template
    
      ★ BEDROCK Q2-B01 [GEN]: "Struct template (memorize verbatim):
        struct NAME {
          TYPE field_name;
          TYPE field_name;
          TYPE field_name;
        };"
        
  → They don't know HOW to translate English to C++
  
    WHY can't they translate?
    
      WHY can't they pick the right TYPE for each field?
      → No heuristic for English-description → C++ type
      
        ★ BEDROCK Q2-B02 [SEM]: "Type selection heuristic:
          'id' / 'number of' / counting word → int
          'name' / 'description' / text → string
          'price' / 'weight' / measurement with decimals → double
          'is' / 'has' / yes-no → bool"
          
      WHY can't they pick the right FIELD NAME?
      → Don't know snake_case convention
      
        ★ BEDROCK Q2-B03 [SYN]: "SIT102 naming: replace spaces with underscores,
          all lowercase. 'number of screens' → number_of_screens"
          
      WHY can't they determine the right NUMBER of fields?
      → Don't know to count the spec items
      
        ★ BEDROCK Q2-B04 [PROC]: "Count numbered items in spec.
          (1), (2), (3) = exactly 3 fields. Write exactly 3. No more, no less."
          
  → They don't know about the trailing `;`
  
    ★ BEDROCK Q2-B05 [SYN]: "}; — close brace AND semicolon after struct.
      The ; is NOT optional. Most-forgotten character in C++."
    ★ BEDROCK Q2-B06 [DISC]: "} alone = end of code block (function, loop, if).
      }; = end of struct DEFINITION (it's a statement, statements end with ;)."
      
  → They don't know that "data structure" means "struct"
  
    ★ BEDROCK Q2-B07 [LEX]: "In SIT102 exam language:
      'data structure' = write a struct.
      'capture these fields' = one struct field per spec item."
      
  → They don't know the struct name must match the spec EXACTLY
  
    ★ BEDROCK Q2-B08 [PROC]: "struct name = whatever the question says.
      'named desk_data' → struct desk_data. Character-for-character match."
      
  → They don't know field names matter for later questions
  
    ★ BEDROCK Q2-B09 [REL]: "Q2 field names propagate to Q3 cin lines
      and Q4 cout lines. Typo here cascades. Write clearly, check spelling."
      
  → They don't have the MUSCLE MEMORY to write it quickly
  
    ★ BEDROCK Q2-B10 [GEN]: "Must be able to write a struct from ANY spec
      in under 5 minutes from cold. This requires writing 20+ practice structs."

### Q2 canonical answer:

```cpp
struct desk_data {
  int user_id;
  int desk_id;
  int number_of_screens;
};
```

### Q2 BEDROCK COUNT: 10 terminal knowledge units

---

## 1.3 — Q3 ZERO STATE: "Write a function to read in information"

The student sees:

```
3. Write a function to read in the information for a number_to_read
   number of desks into desk_list.
   void read_desks ( desk_data &desk_list [], int number_to_read )
```

### WHY is Q3 blank?

```
WHY can't they answer Q3?
→ They can't write a function body to fill an array of structs from cin

  WHY can't they write this function body?
  → Multiple compound failures:

  → They can't PARSE the given signature
  
    WHY can't they parse it?
    
      WHY don't they know `void`?
        → Covered by Q1-B17
        
      WHY don't they know `desk_data &desk_list[]`?
      → Three concepts compressed: type + reference + array parameter
      
        ★ BEDROCK Q3-B01 [SYN]: "TYPE &name[] in parameter = array of TYPE,
          passed by reference. Empty [] = size unknown, need count parameter."
        ★ BEDROCK Q3-B02 [SEM]: "WHY empty []? Because the function doesn't know
          how big the array is. That's WHY there's a second parameter (count)."
        ★ BEDROCK Q3-B03 [SEM]: "WHY &? Because the function needs to MODIFY
          the array contents (fill with cin data) and have changes visible to caller."
          
      WHY don't they know `int number_to_read`?
        ★ BEDROCK Q3-B04 [SEM]: "count parameter = how many elements to process.
          This is the LOOP BOUND. NOT the array capacity."
          
  → They don't know WHAT to write inside
  
    WHY don't they know what goes inside?
    → No template for "read function body"
    
      ★ BEDROCK Q3-B05 [GEN]: "Read function body template (memorize verbatim):
        {
          int i;
          for (i = 0; i < count_param; i++) {
            cin >> arr[i].field1;
            cin >> arr[i].field2;
            cin >> arr[i].field3;
          }
        }"
        
    → They don't know about `cin` and `>>`
    
      ★ BEDROCK Q3-B06 [SEM]: "cin >> x = pause program, wait for keyboard input,
        store typed value into variable x."
      ★ BEDROCK Q3-B07 [SPAT]: ">> points WHERE data flows: FROM keyboard INTO variable.
        cin >> x : data flows left-to-right, from cin into x."
      ★ BEDROCK Q3-B08 [DISC]: "<< is cout (output TO screen).
        >> is cin (input FROM keyboard). Arrows show data direction.
        WRONG: cin << x. RIGHT: cin >> x."
        
    → They don't know composite access in cin
    
      ★ BEDROCK Q3-B09 [COMP]: "cin >> desk_list[i].user_id
        = read keyboard input into the user_id field of the i-th desk.
        Three operations chained: index array [i], access field .user_id, read into it."
      ★ BEDROCK Q3-B10 [SYN]: "order: array[index].field — index FIRST, dot SECOND.
        WRONG: array.field[index]. RIGHT: array[index].field."
        
    → They don't know NO COUT goes in a read function
    
      ★ BEDROCK Q3-B11 [SEM]: "V2.0 contract: read functions = pure cin.
        NO cout prompts inside the function body.
        Caller (main, Q4) handles all prompts."
        
    → They don't know the loop bound is the count parameter
    
      ★ BEDROCK Q3-B12 [SEM]: "loop bound = number_to_read (the count parameter).
        NOT SIZE, NOT MAX, NOT a hardcoded number.
        WRONG: i < MAX. RIGHT: i < number_to_read."
        
    → They don't know field names must match Q2 exactly
    
      ★ BEDROCK Q3-B13 [REL]: "cin lines use the EXACT field names from Q2.
        Q2 says user_id → Q3 writes cin >> desk_list[i].user_id
        Check Q2 before writing Q3. Character-for-character."

### Q3 canonical answer:

```cpp
void read_desks(desk_data &desk_list[], int number_to_read)
{
  int i;
  for (i = 0; i < number_to_read; i++) {
    cin >> desk_list[i].user_id;
    cin >> desk_list[i].desk_id;
    cin >> desk_list[i].number_of_screens;
  }
}
```

### Q3 BEDROCK COUNT: 13 terminal knowledge units

---

## 1.4 — Q4 ZERO STATE: "Write the main function"

The student sees:

```cpp
int main()
{
  const int    MAX = 100;
  desk_data    desks[MAX];
  int          desk_num;

  // Ask for number of desks
  // Read in desk list
  // Print list of desks
}
```

Instruction: "Write the main function which asks the user for desk_num number of desks. Then call your read_desks function to read in data for desk_num desks. Finally, print the list of desks."

### WHY is Q4 blank?

```
WHY can't they answer Q4?
→ They can't fill 3 sections in a given skeleton

  WHY can't they fill the sections?
  
  → SECTION 1: "Ask for number of desks" — prompt + cin
  
    WHY can't they write this?
    
      WHY don't they know the prompt-read pattern?
        ★ BEDROCK Q4-B01 [PAT]: "prompt-read pair:
          cout << 'Enter something: ';
          cin >> variable;
          ALWAYS together. cout first (tell user what to type), cin second (read it)."
          
      WHY don't they know WHICH variable to read into?
        ★ BEDROCK Q4-B02 [PROC]: "read the skeleton declarations.
          'desk_num' is declared as int. Comment says 'number of desks'.
          Therefore: cin >> desk_num;"
          
  → SECTION 2: "Read in desk list" — function call
  
    WHY can't they write the function call?
    
      WHY don't they know function call syntax?
        ★ BEDROCK Q4-B03 [SYN]: "function_name(arg1, arg2);
          Arguments match parameter types in declaration order."
          
      WHY do they put & at the call site?
        ★ BEDROCK Q4-B04 [DISC]: "& appears in function DEFINITION only.
          At call site: just pass the variable name.
          WRONG: read_desks(&desks, desk_num)
          RIGHT: read_desks(desks, desk_num)"
          
      WHY do they pass MAX instead of desk_num?
        ★ BEDROCK Q4-B05 [SEM]: "MAX = array CAPACITY (how big the box is).
          desk_num = ACTUAL COUNT (how much stuff is in the box).
          Always pass the STUFF, not the BOX SIZE.
          WRONG: read_desks(desks, MAX) — reads 100 garbage entries.
          RIGHT: read_desks(desks, desk_num) — reads only what user asked for."
          
      WHY don't they know to pass array name alone?
        ★ BEDROCK Q4-B06 [SYN]: "to pass array as argument: just write its name.
          WRONG: desks[], desks[MAX], &desks
          RIGHT: desks"
          
  → SECTION 3: "Print list of desks" — output loop
  
    WHY can't they write the print loop?
    
      ★ BEDROCK Q4-B07 [GEN]: "Print loop template (memorize verbatim):
        for (int i = 0; i < desk_num; i++) {
          cout << 'Label: ' << desks[i].field << endl;
          cout << 'Label: ' << desks[i].field << endl;
          cout << 'Label: ' << desks[i].field << endl;
        }"
        
      WHY must the loop bound be desk_num, not MAX?
        → Same as Q4-B05. MAX prints 100 rows of garbage.
        ★ BEDROCK Q4-B08 [SEM]: "print loop bound = desk_num. ALWAYS.
          desk_num appears in EXACTLY 3 places in Q4:
          1. cin >> desk_num (read it)
          2. read_desks(desks, desk_num) (pass it)
          3. i < desk_num (loop on it)
          If desk_num isn't in all 3: something is wrong."
          
      WHY don't they know composite access for output?
        ★ BEDROCK Q4-B09 [COMP]: "desks[i].user_id = i-th struct's user_id field.
          Index FIRST, dot SECOND. Same as Q3 but with cout instead of cin."
          
      WHY don't they know `endl`?
        ★ BEDROCK Q4-B10 [LEX]: "endl = end line. Moves cursor to next line.
          Without endl, all output prints on one line."
          
      WHY don't they know `<<` chaining?
        ★ BEDROCK Q4-B11 [SYN]: "cout << a << b << c = output a, then b, then c.
          Chain multiple outputs in one statement."
          
  → They forget `return 0;`
  
    ★ BEDROCK Q4-B12 [SYN]: "return 0; = last line of main.
      Means 'program completed successfully'. Always include."
      
  → They don't know field names must match Q2 exactly
  
    ★ BEDROCK Q4-B13 [REL]: "cout field names = EXACT match to Q2 struct fields.
      Q2 says user_id → Q4 writes desks[i].user_id
      Glance back at Q2. Don't trust memory."

### Q4 canonical answer:

```cpp
int main()
{
  const int    MAX = 100;
  desk_data    desks[MAX];
  int          desk_num;

  cout << "Enter number of desks: ";
  cin >> desk_num;

  read_desks(desks, desk_num);

  for (int i = 0; i < desk_num; i++) {
    cout << "User ID: " << desks[i].user_id << endl;
    cout << "Desk ID: " << desks[i].desk_id << endl;
    cout << "Screens: " << desks[i].number_of_screens << endl;
  }

  return 0;
}
```

### Q4 BEDROCK COUNT: 13 terminal knowledge units

---

## 1.5 — CROSS-CUTTING ZERO STATE: "Why blank on ALL questions?"

```
WHY did they sit for 90 minutes and write NOTHING on ANY question?

  → Perfectionism freeze
    ★ BEDROCK X-B01 [META]: "Wrong > blank. Always. Partial credit exists.
      Write what you can. A wrong struct with };  gets more marks than blank."
      
  → No exam strategy (order, timing)
    ★ BEDROCK X-B02 [PROC]: "Do Q2 first (5 min, easiest marks, builds momentum).
      Then Q4 (uses Q2 fields while fresh). Then Q3. Then Q1 (hardest, last)."
    ★ BEDROCK X-B03 [PROC]: "Time budget: Q2=10min, Q4=30min, Q3=25min, Q1=25min.
      If stuck: write something plausible, move on, come back in buffer time."
      
  → Anxiety cascade ("can't do Q1 → can't do anything")
    ★ BEDROCK X-B04 [META]: "Failing Q1 says NOTHING about Q2/Q3/Q4.
      They are independent skills. You can ace Q2 with zero Q1 knowledge."
      
  → No partial-answer reflex
    ★ BEDROCK X-B05 [PROC]: "If stuck on Q3: write 'int i;' and the for-loop header.
      That's already marks. Then try one cin line. More marks. Build up."
      
  → False proximity trap (code looks readable)
    ★ BEDROCK X-B06 [META]: "C++ keywords look like English. This is a trap.
      If after 5 minutes you haven't started writing: you DON'T understand.
      Switch to Q2. Don't spend 90 minutes on false proximity."

### CROSS-CUTTING BEDROCK COUNT: 6 terminal knowledge units

---

## TOTAL ZERO-STATE BEDROCK INVENTORY

| Question | Bedrocks | Primary types |
|---|---|---|
| Q1 (trace) | 54 | SEM, PROC, LEX, DISC, COMP |
| Q2 (struct) | 10 | GEN, SYN, PROC, REL |
| Q3 (read fn) | 13 | GEN, SEM, COMP, DISC, REL |
| Q4 (main) | 13 | GEN, SEM, DISC, COMP, REL |
| Cross-cutting | 6 | META, PROC |
| **TOTAL** | **96** | — |
| Deduplicated (shared across Qs) | ~**82** | — |

**82 unique terminal knowledge units** that a blank slate must acquire.

---

# PART 2 — TERMINAL WHY: MASTERY STATE

"Why does a master write all 4 answers perfectly in under 60 minutes?"

We reverse the analysis. For each question, WHY can they do it? What is the POSITIVE knowledge state at each bedrock?

## 2.1 — Q1 MASTERY STATE

```
WHY can they hand-execute Q1 perfectly?

  → They INSTANTLY recognize the algorithm pattern
  
    WHY?
    → They've seen sum-of-positives 20+ times in practice
    
      WHY does repetition produce recognition?
      → Pattern is chunked into single unit in long-term memory
      
        ★ MASTERY Q1-M01 [PAT]: "See 'result=0; for; if(>0); result+=x'
          → instantly think 'sum of positives' → predict answer
          → then VERIFY with trace."
          
  → They can set up a trace table in 30 seconds
  
    WHY?
    → The format is automatic — they don't think about it
    
      ★ MASTERY Q1-M02 [PROC]: "Trace setup is MUSCLE MEMORY:
        draw columns: iter | i | numbers[i] | condition | action | mystery
        draw 7 rows (pre-loop + 5 iterations + post-loop exit)
        fill 'mystery = 0.0' in pre-loop row WITHOUT HESITATION."
        
  → They read the brace-init and IMMEDIATELY know all field values
  
    WHY?
    → Brace-init parsing is automatic: outer = struct fields in order, inner = array
    
      ★ MASTERY Q1-M03 [SYN]: "See { {a,b,c,d,e}, f } →
        INSTANT parse: numbers = {a,b,c,d,e}, mystery = f.
        No thinking needed. No counting fields."
        
  → They trace each iteration in 30 seconds
  
    WHY?
    → Each iteration is a 3-step micro-procedure run on autopilot
    
      ★ MASTERY Q1-M04 [PROC]: "Per-iteration micro-procedure:
        1. Look up numbers[i] value.
        2. Test: is it > 0? Write T or F.
        3. If T: add to mystery, write new value. If F: write 'skip'.
        30 seconds per row. 5 rows = 2.5 minutes. Done."
        
  → They NEVER fall for the -0.9 overwrite trap
  
    WHY?
    → They've been burned by it (or drilled on it) so many times it's REFLEXIVE
    
      ★ MASTERY Q1-M05 [SEM]: "See 'data.mystery = 0.0' INSIDE function →
        IMMEDIATELY think: 'overwrite, init value is dead.'
        This is not a deduction. It's a reflex."
        
  → They verify with pattern-check at the end
  
    WHY?
    → Sanity-check procedure is part of their trace routine
    
      ★ MASTERY Q1-M06 [PROC]: "After trace complete:
        1. Pattern check: sum of positives = 2.4 + 3.0 + 2.0 = 7.4 ✓
        2. Arithmetic check: 0.0 → 2.4 → 5.4 → 7.4 ✓
        3. Loop exit check: i = 5, 5 < 5 = false ✓
        All three match → confident answer."

### Q1 mastery = 6 positive knowledge states

---

## 2.2 — Q2 MASTERY STATE

```
WHY can they write Q2 perfectly in 5 minutes?

  → The struct template is in MUSCLE MEMORY
  
    ★ MASTERY Q2-M01 [GEN]: "Hand starts writing before brain finishes reading.
      'struct' → brace → fields → }; → done.
      Template is motorically automatic, like signing your name."
      
  → They translate English → type INSTANTLY
  
    ★ MASTERY Q2-M02 [SEM]: "See 'id' → int. See 'number of' → int.
      No deliberation. The heuristic is compiled into reflex."
      
  → "};" is physically automatic
  
    ★ MASTERY Q2-M03 [GEN]: "After writing }, hand writes ; WITHOUT THINKING.
      Not 'remember the semicolon.' The ; is part of the } for structs.
      They are ONE movement."
      
  → They cross-check field count against spec
  
    ★ MASTERY Q2-M04 [PROC]: "After writing struct, verify:
      spec items = 3, struct fields = 3. Match. Done.
      This check takes 5 seconds. It catches 'forgot a field' errors."
```

### Q2 mastery = 4 positive knowledge states

---

## 2.3 — Q3 MASTERY STATE

```
WHY can they write Q3 perfectly in 15 minutes?

  → The read-function template is in MUSCLE MEMORY
  
    ★ MASTERY Q3-M01 [GEN]: "Template auto-deploys:
      int i; → for loop with count param → cin per field.
      Variations in field names and entity names, same skeleton."
      
  → They look BACK at Q2 for field names
  
    ★ MASTERY Q3-M02 [REL]: "Before writing cin lines, eyes flick to Q2.
      Read field names from own struct answer. Copy character-for-character.
      This is TRAINED BEHAVIOR, not natural instinct."
      
  → They write cin >> arr[i].field without hesitation
  
    ★ MASTERY Q3-M03 [COMP]: "cin >> desk_list[i].user_id is a CHUNK.
      Not built from pieces each time. Written as one rehearsed unit."
      
  → They NEVER write cout in the read function
  
    ★ MASTERY Q3-M04 [NEG]: "Read function = cin only.
      The ABSENCE of cout is as learned as the PRESENCE of cin.
      They don't suppress an urge to add cout — it never occurs to them."
      
  → They use count_param as loop bound, not MAX
  
    ★ MASTERY Q3-M05 [SEM]: "number_to_read is the bound. Period.
      MAX doesn't even enter consideration. It's not relevant here."
```

### Q3 mastery = 5 positive knowledge states

---

## 2.4 — Q4 MASTERY STATE

```
WHY can they write Q4 perfectly in 20 minutes?

  → They see 3 comments as 3 sections to fill
  
    ★ MASTERY Q4-M01 [PROC]: "Skeleton = scaffold. Comments = instructions.
      Read each comment → write the code below it. Three sections, three actions."
      
  → Section 1 (prompt + cin) is automatic
  
    ★ MASTERY Q4-M02 [GEN]: "cout << prompt; cin >> desk_num;
      This pair is one unit. Written together, never separated."
      
  → Section 2 (function call) has NO & and uses desk_num
  
    ★ MASTERY Q4-M03 [GEN]: "read_desks(desks, desk_num);
      Two facts baked in: no & at call site, desk_num not MAX.
      Not remembered each time — AUTOMATIC."
      
  → Section 3 (print loop) uses desk_num as bound
  
    ★ MASTERY Q4-M04 [GEN]: "Print loop deploys same template as Q3 loop
      but with cout instead of cin. Same composite access. Same bound."
      
  → They perform the desk_num audit at the end
  
    ★ MASTERY Q4-M05 [PROC]: "Final check: desk_num appears exactly 3 times:
      1. cin >> desk_num
      2. read_desks(desks, desk_num)
      3. i < desk_num
      Count = 3 → pass. Count ≠ 3 → find the error."
      
  → return 0; is reflexive
  
    ★ MASTERY Q4-M06 [GEN]: "return 0; after the last } is automatic.
      Like ending a sentence with a period."
```

### Q4 mastery = 6 positive knowledge states

---

## 2.5 — CROSS-CUTTING MASTERY STATE

```
WHY do they finish all 4 in under 60 minutes with confidence?

  ★ MASTERY X-M01 [PROC]: "Order is pre-decided: Q2 → Q4 → Q3 → Q1.
    No decision paralysis. Open paper, start Q2 immediately."
    
  ★ MASTERY X-M02 [META]: "Between questions: 3 breaths (4-4-6-4).
    Resets nervous system. Worth 30 seconds."
    
  ★ MASTERY X-M03 [META]: "If stuck: write something, move on, come back.
    This reflex was TRAINED in practice mocks, not hoped for."
    
  ★ MASTERY X-M04 [META]: "This is rep 51, not rep 1.
    They've written this exact exam shape 50 times in practice.
    The exam is RETRIEVAL, not creation."
```

### Cross-cutting mastery = 4 positive knowledge states

---

## MASTERY INVENTORY

| Question | Mastery states | What they look like |
|---|---|---|
| Q1 | 6 | Pattern recognition + automatic trace procedure + trap reflexes |
| Q2 | 4 | Muscle-memory template + automatic `;` + instant type mapping |
| Q3 | 5 | Template recall + cross-Q checking habit + composite chunks |
| Q4 | 6 | 3-section procedure + desk_num audit + return 0; reflex |
| Cross | 4 | Order, breathing, anti-freeze reflex, "rep 51" frame |
| **TOTAL** | **25** | — |

---

# PART 3 — THE GAP MAP

What transforms each ZERO-STATE bedrock into its corresponding MASTERY-STATE?

The gap between 0 and 1 is not one thing. It is **82 bedrocks that must each be individually installed**, then **combined**, then **automated**.

## 3.1 — The three phases of each bedrock installation

Every bedrock goes through three phases:

| Phase | Name | What happens | Card types |
|---|---|---|---|
| 1 | INSTALL | Student encounters the knowledge for the first time | DemoCard, WalkthroughCard |
| 2 | VERIFY | Student proves they can recall/apply it | MCQCard, ClozeCard, TraceCard |
| 3 | AUTOMATE | Student does it without thinking | WriteCard, ProceduralCard, CodeMemorizeCard |

Each phase requires different card types. Each bedrock needs ALL THREE phases.

## 3.2 — Card count per bedrock

| Bedrock type | Phase 1 (install) | Phase 2 (verify) | Phase 3 (automate) | Total |
|---|---|---|---|---|
| LEX (token meaning) | 1 Demo | 2 MCQ + 1 Cloze | 1 Memorize | 5 |
| SYN (grammar rule) | 1 Demo | 2 MCQ + 2 Cloze | 1 CodeMemorize | 6 |
| SEM (what code does) | 1 Demo + 1 Walkthrough | 2 MCQ + 1 Trace | 1 Write | 6 |
| PROC (procedure) | 1 Demo + 1 Walkthrough | 1 MCQ + 1 Trace | 1 Procedural | 5 |
| DISC (discrimination) | 1 Demo (side-by-side) | 3 MCQ (confusable) | 1 Cloze + 1 Write | 6 |
| COMP (composition) | 1 Demo | 1 Walkthrough + 1 Trace | 1 Write | 4 |
| GEN (cold production) | 1 Demo | 1 TemplateRecall | 1 Write + 1 Procedural | 4 |
| PAT (pattern recognition) | 1 Demo | 2 MCQ | 1 Trace | 4 |
| META (self-knowledge) | 1 Demo | 1 MCQ | — | 2 |
| NEG (what it's NOT) | 1 Demo | 2 MCQ (trap) | 1 Cloze | 4 |
| REL (cross-Q coupling) | 1 Demo | 1 MultiStep | 1 Write | 3 |
| COUNTER (what-if) | 1 Demo (side-by-side) | 2 MCQ | 1 Trace | 4 |
| SPAT (direction/flow) | 1 Demo (arrows) | 2 MCQ | 1 Cloze | 4 |
| TEMP (when things happen) | 1 Demo | 1 Walkthrough | 1 Trace | 3 |

Average: ~4.5 cards per bedrock.

## 3.3 — Total card estimate from terminal epistemology

| Source | Bedrocks | × avg cards | = cards |
|---|---|---|---|
| Q1 zero-state | 54 | × 4.5 | 243 |
| Q2 zero-state | 10 | × 4.5 | 45 |
| Q3 zero-state | 13 | × 4.5 | 59 |
| Q4 zero-state | 13 | × 4.5 | 59 |
| Cross-cutting | 6 | × 3 | 18 |
| Dedup savings | -14 shared bedrocks | × -4.5 | -63 |
| **Subtotal (core)** | **82** | — | **361** |
| Entity variant drill (8 entities × 4 Q-shapes) | — | — | 256 |
| Confusable pair deep drill (6 pairs × 8 cards) | — | — | 48 |
| Q1 trap inoculation (6 traps × 8 cards) | — | — | 48 |
| Q2-Q4 trap inoculation (16 traps × 6 cards) | — | — | 96 |
| Template memorization (4 templates × 12 variants) | — | — | 48 |
| Mock papers (10 full mocks × 4 Qs) | — | — | 40 |
| Spaced repetition duplicates (each card revisited 3×) | — | — | 1,083 |
| Procedural 3-streak gates (82 bedrocks × 1 gate each) | — | — | 82 |
| Speed/automaticity drill (timed variants) | — | — | 200 |
| **GRAND TOTAL** | — | — | **~2,262 unique + ~1,738 spaced reps = ~4,000 encounters** |

**~4,000 card encounters** is the number needed for blank-slate → mastery. This matches the user's intuition.

But the key insight: these aren't 4,000 random cards. They're **82 bedrocks × ~27 encounters each** (install + verify + automate + 3 spaced reps + entity variants + trap drills).

---

# PART 4 — THE IDEAL LINEAR APP

No branching. No choice. Walk forward. Card by card. Every card is a WHY→HOW unit.

## 4.1 — The card unit structure

Every card follows this pattern:

```
INPUT:   What you see (code snippet, question, blank editor)
WHY:     Why this matters for Test 2 (1 sentence, always visible)
HOW:     How it works (the knowledge being taught/tested)
OUTPUT:  What you produce (answer, trace, code, selection)
```

This maps to the terminal epistemology: each card IS one WHY/HOW terminal question, answered through interaction.

### Examples by card type:

**DemoCard (Phase 1 — install)**:
```
INPUT:   See this code:  data.mystery = 0.0;
WHY:     "Assignment destroys old value. If d.mystery was -0.9, it's now 0.0."
HOW:     = means STORE right into left. Old value is gone.
OUTPUT:  Press space to advance (passive intake, first exposure)
```

**MCQCard (Phase 2 — verify)**:
```
INPUT:   After data.mystery = 0.0; runs, what is d.mystery?
WHY:     "The overwrite trap — #1 error on Q1."
HOW:     Pick the correct answer from 4 options.
OUTPUT:  Select: 0.0 (correct) | -0.9 (trap) | undefined (wrong) | 0 (type error)
```

**TraceCard (Phase 2 — verify)**:
```
INPUT:   Trace this loop. Fill in mystery value after each iteration.
WHY:     "This is the exact skill Q1 tests."
HOW:     Walk line by line, update values, report.
OUTPUT:  Fill memory boxes: i=0 → mystery=2.4, i=1 → skip, ...
```

**WriteCard (Phase 3 — automate)**:
```
INPUT:   Write a struct named printer_data with fields: printer_id (int),
         model_id (int), paper_count (int).
WHY:     "This is Q2 with different entity names."
HOW:     Recall struct template, fill slots from spec.
OUTPUT:  Type: struct printer_data { int printer_id; int desk_id; int paper_count; };
```

**ProceduralCard (Phase 3 — automate, 3-streak gate)**:
```
INPUT:   Write the read function for vehicle_data with fields:
         vehicle_id, wheels, mileage. Count parameter: num_vehicles.
WHY:     "Q3 with unfamiliar entity. Same template, different slots."
HOW:     Deploy template from memory, substitute names.
OUTPUT:  Full function body. Must pass 3 times in a row with different entities.
```

## 4.2 — The linear sequence (walk order)

The app presents cards in a FIXED order. No choices. No menu. No skipping. Just: next card.

The order follows terminal epistemology dependencies: you cannot learn bedrock B if bedrock A hasn't been installed first.

### LAYER 0: PRE-PROGRAMMING (cards 1-80)

Bedrocks installed: Q1-B01, Q1-B02, Q1-B06, Q1-B07, Q1-B08

What the student knows after Layer 0:
- What a computer does (CPU = instruction follower)
- What memory is (labeled boxes)
- What variables are (name + value)
- What "hand execute" means (pretend to be CPU)
- That code runs one line at a time, top to bottom
- That `=` is ASSIGNMENT, not equality (the biggest unlearn)
- That `;` ends every statement

Card sequence:

```
Card 001 [Demo]    INPUT: "What is a computer?"
                   WHY: Every Q reduces to "pretend you're the CPU."
                   HOW: CPU reads one instruction, does it, reads next. Cannot guess.
                   OUTPUT: space to advance

Card 002 [Demo]    INPUT: "What is memory?"
                   WHY: Every variable in the trace lives in memory.
                   HOW: Giant grid of boxes. Each holds a value. CPU reads/writes them.
                   OUTPUT: space to advance

Card 003 [Demo]    INPUT: "What is a variable?"
                   WHY: Tracing IS tracking variable values.
                   HOW: Labeled box. Label = name (never changes). Contents = value (changes).
                   OUTPUT: space to advance

Card 004 [MCQ]     INPUT: A variable's name can change during execution. True or false?
                   WHY: Must understand name vs value distinction.
                   HOW: Pick answer.
                   OUTPUT: False — name is fixed, only VALUE changes.

Card 005 [Demo]    INPUT: "What does code look like?"
                   WHY: You need to read code before you can trace it.
                   HOW: Text following strict rules. Lines run top-to-bottom.
                   OUTPUT: space to advance

Card 006 [Demo]    INPUT: "What is a statement?"
                   WHY: Each line you trace is one statement.
                   HOW: One instruction. Does one thing. Ends with ;
                   OUTPUT: space to advance

Card 007 [Demo]    INPUT: See this: int x = 5;
                   WHY: This is the simplest statement in C++.
                   HOW: Creates box labeled x, puts 5 inside.
                   OUTPUT: space to advance

Card 008 [MCQ]     INPUT: After int x = 5; runs, what is in box x?
                   WHY: Testing variable initialization understanding.
                   HOW: Pick: 5 | empty | x | unknown
                   OUTPUT: 5

Card 009 [Demo]    INPUT: See this: x = 7;
                   WHY: Assignment DESTROYS old value.
                   HOW: Old value (5) thrown out. New value (7) stored. 5 is GONE.
                   OUTPUT: space to advance

Card 010 [MCQ]     INPUT: After x = 5; then x = 7; — what is x?
                   WHY: Must understand destructive assignment.
                   OUTPUT: 7 (not 5, not 12, not "5 and 7")

Card 011 [Demo]    INPUT: "The = sign in C++ is NOT what you learned in math."
                   WHY: 18 years of math training says = means "is equal to."
                         In C++, = means "store right side INTO left side."
                   HOW: x = x + 1 is valid. Reads OLD x, adds 1, stores result back.
                         In math this is nonsense. In C++ it means "add 1 to x."
                   OUTPUT: space to advance

Card 012 [MCQ]     INPUT: x = 3; then x = x + 1; — what is x?
                   WHY: Tests right-side-first execution.
                   OUTPUT: 4 (not "x+1", not 3, not undefined)

Card 013 [Demo]    INPUT: "Every statement ends with ;"
                   WHY: Missing ; = compile error = program doesn't run.
                   HOW: ; is a mandatory terminator, not optional punctuation.
                   OUTPUT: space to advance

Card 014 [Cloze]   INPUT: int x = 5___
                   WHY: Drill ; placement.
                   OUTPUT: ;

Card 015 [Demo]    INPUT: "What does 'hand execute' mean?"
                   WHY: This is what Q1 literally asks you to do.
                   HOW: Pretend you're the CPU. Read one line. Do it.
                         Update your variable boxes. Move to next line. Repeat.
                   OUTPUT: space to advance

Card 016 [Demo]    INPUT: "The trace table"
                   WHY: The trace table is your ANSWER FORMAT for Q1.
                   HOW: Columns = variables. Rows = steps. Each cell = current value.
                         Draw it FIRST, fill it as you trace.
                   OUTPUT: space to advance

Card 017 [Walkthrough] INPUT: Trace: int x = 0; x = x + 3; x = x + 2;
                   WHY: Simplest possible trace (3 lines, 1 variable).
                   HOW: Step through. x starts at 0. Then 3. Then 5.
                   OUTPUT: Predict each step, then reveal.

Card 018 [Trace]   INPUT: Trace: int a = 10; a = a - 3; a = a + 1;
                   WHY: First real trace practice.
                   HOW: Fill in: a = 10, then 7, then 8.
                   OUTPUT: Final value of a = 8.

...cards 019-080: more types (int, double, const), more traces, more assignments,
  integer division gotcha (7/2 = 3 not 3.5), 0 vs 0.0 discrimination...
```

### LAYER 1: OUTPUT AND INPUT (cards 81-130)

Bedrocks installed: cout, <<, cin, >>, endl, chaining, prompt-read pair

```
Card 081 [Demo]    INPUT: cout << "Hello";
                   WHY: Q4 requires cout for prompts and printing.
                   HOW: cout sends text to screen. << pushes data TO cout.
                   OUTPUT: space to advance

Card 082 [Demo]    INPUT: << direction mnemonic
                   WHY: << vs >> confusion kills Q3 silently.
                   HOW: << arrows point TOWARD cout (data flows TO screen).
                        >> arrows point TOWARD variable (data flows INTO variable).
                   OUTPUT: space to advance

Card 083 [MCQ]     INPUT: Which reads from keyboard?
                   WHY: Must discriminate cin/cout.
                   OUTPUT: cin >> x (not cout >> x, not cin << x, not cout << x)

Card 084 [Demo]    INPUT: "The prompt-read pair"
                   WHY: Q4 Section 1 requires this exact pattern.
                   HOW: cout << "Enter something: "; cin >> variable; ALWAYS together.
                   OUTPUT: space to advance

...cards 085-130: endl, chaining (cout << a << b), cin with multiple variables,
  prompt-read drill with different prompts...
```

### LAYER 2: CONTROL FLOW (cards 131-320)

Bedrocks installed: if, for-loop (all 4 parts), comparison operators, boolean logic, ++

This is the LARGEST layer because for-loop tracing IS Q1.

```
Card 131 [Demo]    INPUT: if (x > 0) { cout << "positive"; }
                   WHY: Q1 has an if inside a for-loop. Must understand if first.
                   HOW: Condition true → run body. False → skip body entirely.
                   OUTPUT: space to advance

Card 132 [MCQ]     INPUT: x = -3; if (x > 0) { cout << "yes"; } — what prints?
                   WHY: Tests if-skip understanding.
                   OUTPUT: nothing (body skipped because -3 > 0 is false)

Card 133 [Demo]    INPUT: "Comparison operators"
                   WHY: Q1 uses > 0. Must know all comparisons.
                   HOW: > < >= <= == != — each produces true or false.
                   OUTPUT: space to advance

Card 134 [Demo]    INPUT: "> is STRICT. 0 > 0 = false."
                   WHY: If array contained 0, strict > would skip it. Trap.
                   HOW: > excludes equal. >= includes equal. On Q1: > 0 means STRICTLY positive.
                   OUTPUT: space to advance

Card 135 [MCQ]     INPUT: Is 0 > 0 true or false?
                   OUTPUT: false

Card 136 [MCQ]     INPUT: Is 0 >= 0 true or false?
                   OUTPUT: true

Card 137 [Demo]    INPUT: "= vs == — the most dangerous pair"
                   WHY: = is assignment. == is comparison. Mixing them is the #1 silent bug.
                   HOW: if (x = 5) ASSIGNS 5 to x (always true). if (x == 5) TESTS equality.
                   OUTPUT: space to advance

Card 138 [MCQ]     INPUT: To TEST if x equals 5 inside an if, which symbol?
                   OUTPUT: == (not =, not ===, not .equals)

...cards 139-200: more if practice, else, nested if...

Card 201 [Demo]    INPUT: "The for loop — memorize this structure"
                   WHY: Q1 is entirely a for-loop trace. Q3 and Q4 require writing for-loops.
                   HOW: for (INIT; TEST; INCREMENT) { BODY }
                   OUTPUT: space to advance

Card 202 [Demo]    INPUT: "For-loop execution ORDER — the 5-step dance"
                   WHY: Getting the order wrong = wrong trace = wrong answer.
                   HOW: 1. INIT once → 2. TEST (false=exit) → 3. BODY → 4. INCREMENT → 5. goto 2
                   OUTPUT: space to advance

Card 203 [Walkthrough] INPUT: for (i=0; i<3; i++) { cout << i; }
                   WHY: Trace a 3-iteration loop.
                   HOW: Step through: i=0 print 0, i=1 print 1, i=2 print 2, i=3 exit.
                   OUTPUT: Predict each step.

Card 204 [Trace]   INPUT: for (i=0; i<4; i++) { cout << i*2; }
                   WHY: First loop trace.
                   OUTPUT: terminal = "0246", final i = 4.

Card 205 [MCQ]     INPUT: After for(i=0; i<5; i++){}, what is i?
                   WHY: Off-by-one trap. i = 5 after exit, not 4.
                   OUTPUT: 5

...cards 206-320: many loop traces with different bodies, if inside for,
  accumulator pattern (sum), counter pattern, max pattern, min pattern...
```

### LAYER 3: COMPOUND TYPES (cards 321-480)

Bedrocks installed: arrays, structs, field access, brace-init, `};`

```
Card 321 [Demo]    INPUT: "Arrays — numbered row of boxes"
                   WHY: Q1 has numbers[SIZE]. Q3-Q4 have desks[MAX].
                   HOW: double numbers[5]; → 5 boxes, all double, numbered 0-4.
                   OUTPUT: space to advance

Card 322 [Demo]    INPUT: "Zero-indexed"
                   WHY: numbers[0] is first, numbers[4] is last. NOT numbers[1] to numbers[5].
                   HOW: First = [0]. Last = [SIZE-1]. [SIZE] is OUT OF BOUNDS.
                   OUTPUT: space to advance

Card 323 [MCQ]     INPUT: double arr[5]; — what is the LAST valid index?
                   OUTPUT: 4 (not 5)

...cards 324-380: array declaration, access, loops over arrays...

Card 381 [Demo]    INPUT: "Structs — bundle values under one name"
                   WHY: Q1 uses stat_double. Q2 asks you to WRITE a struct.
                   HOW: struct NAME { TYPE field; TYPE field; };
                         Creates a new TYPE. You can make variables of this type.
                   OUTPUT: space to advance

Card 382 [Demo]    INPUT: "The trailing };"
                   WHY: Most-forgotten character in C++. Lose marks on Q2 for this.
                   HOW: } alone ends a code block. }; ends a struct DEFINITION.
                         The ; is mandatory because the struct definition IS a statement.
                   OUTPUT: space to advance

Card 383 [MCQ]     INPUT: What goes after the closing brace of a struct?
                   OUTPUT: ; (not nothing, not { }, not ;;)

Card 384 [Cloze]   INPUT: struct desk_data { int x; int y; }___
                   OUTPUT: ;

...cards 385-420: struct definition practice, field access with dot...

Card 421 [Demo]    INPUT: "Brace initialization"
                   WHY: Q1 initializes d with { {array}, scalar }.
                   HOW: stat_double d = { {2.4,-3.7,-1.7,3.0,2.0}, -0.9 };
                         Outer {} = struct fields in declaration order.
                         Inner {} = array contents.
                   OUTPUT: space to advance

Card 422 [Walkthrough] INPUT: Parse { {2.4,-3.7,-1.7,3.0,2.0}, -0.9 }
                   WHY: Must extract all 6 values correctly.
                   HOW: numbers = {2.4,-3.7,-1.7,3.0,2.0}, mystery = -0.9
                   OUTPUT: Predict each field value.

Card 423 [Trace]   INPUT: Given stat_double d = {...}; what is d.numbers[3]?
                   OUTPUT: 3.0

Card 424 [Trace]   INPUT: What is d.mystery?
                   OUTPUT: -0.9

...cards 425-480: composite access (struct.field[i]), array of structs (desks[i].field),
  discrimination: desks[i].field vs desks.field[i]...
```

### LAYER 4: FUNCTIONS AND REFERENCES (cards 481-650)

Bedrocks installed: function definition, calling, parameters, void, &, pass-by-ref vs value

```
Card 481 [Demo]    INPUT: "Functions — named reusable code blocks"
                   WHY: Q1 is a function call. Q3 asks you to WRITE a function body.
                   HOW: void name(TYPE param) { body }
                         Defined once, called by name.
                   OUTPUT: space to advance

Card 482 [Demo]    INPUT: "Calling a function"
                   WHY: Q1 calls who_am_i(d). Q4 calls read_desks(desks, desk_num).
                   HOW: name(arguments); — pause current line, jump in, run, jump back.
                   OUTPUT: space to advance

Card 483 [Demo]    INPUT: "Parameters — function inputs"
                   WHY: data in who_am_i is a parameter. It receives d.
                   HOW: Parameter = named slot. Argument fills the slot at call time.
                   OUTPUT: space to advance

Card 484 [Demo]    INPUT: "Pass by VALUE (no &) — the copy"
                   WHY: Understanding WHY & matters requires understanding what happens WITHOUT it.
                   HOW: void f(int x) { x = x+1; }
                         int a = 5; f(a); — a is STILL 5. Function modified a COPY.
                   OUTPUT: space to advance

Card 485 [Trace]   INPUT: void f(int x) { x = 10; } int a = 5; f(a); cout << a;
                   WHY: Must see that a is unchanged.
                   OUTPUT: terminal = "5"

Card 486 [Demo]    INPUT: "Pass by REFERENCE (with &) — the alias"
                   WHY: Q1's entire answer depends on understanding &.
                   HOW: void f(int &x) { x = x+1; }
                         int a = 5; f(a); — a is now 6. x WAS a. Same memory.
                   OUTPUT: space to advance

Card 487 [Trace]   INPUT: void f(int &x) { x = 10; } int a = 5; f(a); cout << a;
                   WHY: Must see that a IS changed.
                   OUTPUT: terminal = "10"

Card 488 [Demo]    INPUT: "& — side by side comparison"
                   WHY: The DIFFERENCE between cards 485 and 487 is the entire point.
                   HOW: Without &: copy, changes die. With &: alias, changes persist.
                   OUTPUT: space to advance

Card 489 [MCQ]     INPUT: void g(double &val) { val = 0.0; }
                   double m = -0.9; g(m); — what is m?
                   WHY: This is EXACTLY what happens in Q1.
                   OUTPUT: 0.0 (not -0.9)

Card 490 [Demo]    INPUT: "& at definition, NOT at call site"
                   WHY: Writing &desks at call site = compile error. Trap in Q4.
                   HOW: Definition: void f(int &x) — & HERE.
                         Call: f(a) — NO & here.
                   OUTPUT: space to advance

Card 491 [MCQ]     INPUT: void read_desks(desk_data &list[], int n)
                   How do you CALL this function?
                   WHY: Q4 call site trap.
                   OUTPUT: read_desks(desks, desk_num) — NO &, NO []

...cards 492-650: void functions, return, function call during trace procedure,
  array parameters, multiple parameters...
```

### LAYER 5: Q1 — FULL HAND-EXECUTE (cards 651-1100)

This is the largest layer. 450 cards dedicated to Q1 mastery.

Bedrocks verified: ALL Q1 bedrocks (B01-B54) + MASTERY states (M01-M06)

```
Card 651 [Demo]    INPUT: "Q1 — what the exam actually asks"
                   WHY: Must know the TASK before attempting it.
                   HOW: "Hand execute" = trace table + final variable values + terminal output.
                   OUTPUT: space to advance

Card 652 [Demo]    INPUT: The actual Q1 V2.0 code (full listing)
                   WHY: See the real exam question for the first time.
                   HOW: Walk through identifying: struct definition, function, brace-init, call.
                   OUTPUT: space to advance

Card 653 [Walkthrough] INPUT: Q1 V2.0 — full step-by-step trace
                   WHY: See the complete trace procedure in action.
                   HOW: 1. Parse struct. 2. Parse function. 3. Brace-init. 4. Call.
                         5. Function body: overwrite mystery. 6. Loop 5 iterations.
                         7. Final: d.mystery = 7.4.
                   OUTPUT: Predict each step, then reveal.

Card 654 [Demo]    INPUT: "TRAP: the -0.9 overwrite"
                   WHY: #1 error on Q1. data.mystery = 0.0 KILLS the initial -0.9.
                   HOW: Answer is 7.4, NOT 6.5. 6.5 = the "I forgot the overwrite" answer.
                   OUTPUT: space to advance

Card 655 [MCQ]     INPUT: data.mystery was initialized to -0.9.
                   Then data.mystery = 0.0; runs. What is data.mystery?
                   OUTPUT: 0.0 (not -0.9, not -0.9+0.0, not undefined)

Card 656 [Trace]   INPUT: Q1 V2.0 — trace it yourself
                   WHY: First real Q1 attempt.
                   OUTPUT: Fill trace table. Final: d.mystery = 7.4.

...cards 657-750: Q1 with different data values, different algorithms
  (count-positive, find-max, find-min, average), different struct names,
  different array sizes...

Card 751 [Demo]    INPUT: "The 5 algorithm patterns"
                   WHY: Recognizing the pattern → predicting the answer → faster trace.
                   HOW: sum-positive, count-positive, find-max, find-min, average.
                   OUTPUT: space to advance

...cards 752-900: entity variant traces (stat_float, data_box, metric_bag,
  score_sheet, temp_log...) — 8 entities × ~20 cards each...

Card 901 [Demo]    INPUT: "Trap inoculation: -0.9 overwrite"
                   WHY: Drill the trap until it's physically impossible to fall for.
                   HOW: 10 trace cards where init value ≠ 0 but function resets to 0.

Card 902 [Trace]   INPUT: mystery init = -5.0, function sets mystery = 0.0.
                   Array = {1.0, -2.0, 3.0}. What is final mystery?
                   OUTPUT: 4.0 (not -1.0)

...cards 903-950: more overwrite traps, strict comparison traps,
  off-by-one traps, reference vs copy traps...

Cards 951-1050 [ProceduralCard]: Q1 trace from cold, 3-streak gate.
  Must correctly trace 3 different programs in a row to pass.

Cards 1051-1100: Speed drills — timed Q1 traces, target under 15 minutes.
```

### LAYER 6: Q2 — STRUCT WRITING (cards 1101-1350)

250 cards for Q2 mastery.

```
Card 1101 [Demo]   INPUT: "Q2 — write a struct from spec"
                   WHY: Easiest question. Do it FIRST on exam day.
                   HOW: Read spec → count fields → pick types → write struct → add };
                   OUTPUT: space to advance

Card 1102 [Demo]   INPUT: "The Q2 procedure (memorize this)"
                   WHY: Procedure > improvisation under stress.
                   HOW: 1. Write 'struct'. 2. Write name from spec. 3. Open {.
                         4. One field per spec item: type name;
                         5. Close };
                         6. CHECK: field count = spec count? }; present?
                   OUTPUT: space to advance

Card 1103 [TemplateRecall] INPUT: Study for 30s, then type from memory:
                   struct desk_data { int user_id; int desk_id; int number_of_screens; };
                   WHY: Must write this from cold.
                   OUTPUT: type exact match

...cards 1104-1200: structs from different specs (printer_data, book_data,
  vehicle_data, recipe_data, student_data, employee_data, computer_data...)

Cards 1201-1250 [StructWriteCard]: Q2-shape production from spec. Graded by sections.

Cards 1251-1300: Confusable drills — }; vs }, snake_case vs camelCase,
  int vs string for "id" fields, field count matching.

Cards 1301-1350 [ProceduralCard]: Q2 from cold, 3-streak gate.
  8 different entity specs. Must write 3 in a row perfectly.
```

### LAYER 7: Q3 — READ FUNCTION (cards 1351-1700)

350 cards for Q3 mastery.

```
Card 1351 [Demo]   INPUT: "Q3 — write a read function body"
                   WHY: Second-hardest question. Must fill function body from given signature.
                   HOW: Signature is given. You write: int i; for-loop; cin per field.
                   OUTPUT: space to advance

Card 1352 [Demo]   INPUT: "The Q3 template (memorize this)"
                   WHY: Template + slot-fill > improvisation.
                   HOW: { int i; for(i=0; i<count_param; i++) { cin >> arr[i].field; per field } }
                   OUTPUT: space to advance

Card 1353 [Demo]   INPUT: "RULE: no cout in read function"
                   WHY: Adding cout loses marks. V2.0 contract.
                   HOW: Read function = pure cin. Prompts belong in main (Q4).
                   OUTPUT: space to advance

Card 1354 [Demo]   INPUT: "RULE: field names must match Q2 EXACTLY"
                   WHY: One typo cascades to compile error in actual code.
                   HOW: Before writing Q3, look back at your Q2 answer. Copy field names.
                   OUTPUT: space to advance

Card 1355 [TemplateRecall] INPUT: Study for 30s, then type read_desks body.
                   OUTPUT: exact match

...cards 1356-1500: read function bodies for all 8 entity variants

Cards 1501-1550 [FunctionWriteCard]: Q3 production with pinned signature.
  Different entity names each time.

Cards 1551-1650: Trap drills — cin vs cout direction, loop bound errors,
  missing [i], missing .field, wrong field names.

Cards 1651-1700 [ProceduralCard]: Q3 from cold, 3-streak gate.
```

### LAYER 8: Q4 — MAIN FUNCTION (cards 1701-2100)

400 cards for Q4 mastery.

```
Card 1701 [Demo]   INPUT: "Q4 — fill 3 sections in main skeleton"
                   WHY: Highest-mark question. Skeleton given; fill the blanks.
                   HOW: Section 1: prompt + cin. Section 2: function call. Section 3: print loop.
                   OUTPUT: space to advance

Card 1702 [Demo]   INPUT: "Section 1: Ask for count"
                   HOW: cout << "Enter number of desks: "; cin >> desk_num;
                   OUTPUT: space to advance

Card 1703 [Demo]   INPUT: "Section 2: Call read function"
                   HOW: read_desks(desks, desk_num); — NO &, use desk_num NOT MAX.
                   OUTPUT: space to advance

Card 1704 [Demo]   INPUT: "MAX vs desk_num — the #1 Q4 trap"
                   WHY: Using MAX reads/prints 100 garbage entries.
                   HOW: MAX = box capacity. desk_num = stuff in box. Always use desk_num.
                   OUTPUT: space to advance

Card 1705 [Demo]   INPUT: "Section 3: Print loop"
                   HOW: for(int i=0; i<desk_num; i++) { cout per field with endl }
                   OUTPUT: space to advance

Card 1706 [Demo]   INPUT: "desk_num audit — final safety check"
                   WHY: Catches MAX/desk_num confusion in all 3 places.
                   HOW: desk_num must appear EXACTLY 3 times:
                         1. cin >> desk_num
                         2. read_desks(desks, desk_num)
                         3. i < desk_num
                   OUTPUT: space to advance

...cards 1707-1900: Q4 with all 8 entity variants, trap drills

Cards 1901-1950 [MainWriteCard]: Q4 production from skeleton. Sectional grading.

Cards 1951-2050: Trap drills — &desks, MAX, wrong field names, missing return 0

Cards 2051-2100 [ProceduralCard]: Q4 from cold, 3-streak gate.
```

### LAYER 9: INTEGRATION AND MOCK EXAMS (cards 2101-2500)

Cross-question coupling + full mocks + speed + exam strategy.

```
Card 2101 [Demo]   INPUT: "Cross-question coupling"
                   WHY: Q2 field names must match Q3 cin and Q4 cout.
                   HOW: Write Q2. Then use YOUR Q2 fields in Q3 and Q4.
                         One naming error cascades across all three questions.
                   OUTPUT: space to advance

Card 2102 [Demo]   INPUT: "Exam order: Q2 → Q4 → Q3 → Q1"
                   WHY: Q2 first = fastest marks. Q4 second = uses Q2 while fresh.
                   HOW: This is your pre-decided order. No thinking on exam day.
                   OUTPUT: space to advance

Card 2103 [Demo]   INPUT: "Time budget: Q2=10, Q4=30, Q3=25, Q1=25"
                   WHY: Prevents spending 60 minutes on Q1 and running out.
                   HOW: Write budget on exam paper margin before starting.
                   OUTPUT: space to advance

Card 2104 [Demo]   INPUT: "If stuck: write something, move on"
                   WHY: Wrong > blank. Partial credit exists.
                   HOW: Write what you know. Leave space. Come back in buffer time.
                   OUTPUT: space to advance

Cards 2105-2120 [Demo/MCQ]: Exam strategy cards, breathing protocol,
  anti-perfectionism, "this is rep 51" reframe.

Cards 2121-2200: Cross-question linked cards.
  "Here's a spec. Write Q2 struct. Now write Q3 cin lines using YOUR field names.
   Now write Q4 print loop using YOUR field names."

Cards 2201-2300 [Full mock papers]: 10 fresh-entity full mock papers.
  Each mock = Q1 trace + Q2 struct + Q3 read fn + Q4 main.
  First 3: untimed. Next 4: 90-minute timer. Last 3: 75-minute timer (speed buffer).

Cards 2301-2400: Weak-spot remediation. Engine identifies which bedrocks failed
  in mocks → surfaces targeted drill cards from earlier layers.

Cards 2401-2500 [ProceduralCard]: Final 3-streak gates.
  Must complete full mock at 10/10 three times in a row to "graduate."
```

## 4.3 — Spaced repetition layer (cards 2501-4000)

The remaining ~1,500 card encounters are SPACED REVIEWS of cards from Layers 0-9.

Spacing schedule per bedrock:

| Offset from first encounter | Card types surfaced |
|---|---|
| +1 day | MCQ + Cloze (verify retention) |
| +3 days | Trace + Write (verify application) |
| +7 days | Procedural (verify automation) |
| +10 days | Cold production only |
| +13 days (exam eve) | Nothing new. Light scan. |

Each bedrock gets 3-5 spaced encounters = 82 × 4 = ~328 re-encounters.
Plus entity variant re-encounters = ~1,172 additional.
Total spaced layer: ~1,500 card encounters.

## 4.4 — Summary: the 4,000-card linear sequence

| Layer | Cards | Bedrocks covered | What student can do after |
|---|---|---|---|
| 0: Pre-programming | 80 | 12 | Knows what code is, what variables are, what tracing is |
| 1: I/O | 50 | 8 | Can write cout/cin pairs, knows stream direction |
| 2: Control flow | 190 | 16 | Can trace if-statements and for-loops |
| 3: Compound types | 160 | 14 | Can read/write arrays, structs, brace-init, }; |
| 4: Functions + refs | 170 | 12 | Understands function calls, & vs no-&, parameters |
| 5: Q1 mastery | 450 | Q1-B01 to B54 | Can hand-execute any Q1-shape program reliably |
| 6: Q2 mastery | 250 | Q2-B01 to B10 | Can write struct from any spec in 5 minutes |
| 7: Q3 mastery | 350 | Q3-B01 to B13 | Can write read function body for any entity |
| 8: Q4 mastery | 400 | Q4-B01 to B13 | Can fill main skeleton for any entity |
| 9: Integration | 400 | X-B01 to B06 + mastery states | Can complete full mock at 10/10 under time pressure |
| Spaced reps | ~1,500 | All 82 recycled | Automated recall, exam-proof retention |
| **TOTAL** | **~4,000** | **82 bedrocks fully installed** | **Mastery: all 4 answers written perfectly from cold** |

---

# PART 5 — WHY THIS WORKS (terminal epistemology of the design itself)

```
WHY does a 4,000-card linear sequence produce mastery?

  → Because every card installs, verifies, or automates exactly ONE bedrock
  
    WHY does that work?
    → Because the 82 bedrocks ARE the complete knowledge for Test 2
    
      WHY are they complete?
      → Because they were extracted by recursive WHY from the actual failure state
      
        WHY does recursive WHY find completeness?
        → Because each WHY chain terminates at an atomic knowledge unit
          that CANNOT be decomposed further.
          Missing one → the chain above collapses → blank answer.
          Having all → every chain is supported → perfect answer.
          
  → Because the linear order respects dependencies
  
    WHY does order matter?
    → Because some bedrocks REQUIRE earlier bedrocks.
      Can't understand brace-init without understanding structs.
      Can't understand structs without understanding types.
      Can't understand types without understanding variables.
      
      WHY can't you just learn them in any order?
      → Because COMPREHENSION requires PREREQUISITES.
        A card about & is meaningless if you don't know what a function is.
        A trace card is meaningless if you don't know what a variable is.
        
  → Because each bedrock gets 3 phases (install → verify → automate)
  
    WHY do you need all 3 phases?
    → INSTALL alone = passive understanding, fades fast.
      VERIFY alone = can't verify what was never installed.
      AUTOMATE alone = can't automate what was never verified.
      All 3 = knowledge moves from "I was told" → "I can recall" → "I do without thinking."
      
  → Because spaced repetition prevents forgetting
  
    WHY does spacing prevent forgetting?
    → Retrieval at increasing intervals strengthens memory traces.
      Each successful recall makes the next recall easier.
      Without spacing: learn Day 1, forget Day 3, blank on Day 7.
      With spacing: learn Day 1, recall Day 2, recall Day 4, recall Day 8 → permanent.
      
  → Because entity variants prevent slot fusion
  
    WHY do you need variants?
    → Without variants: student memorizes "desk_data" and freezes on "printer_data."
      With variants: the TEMPLATE is learned, not the specific entity.
      8 entities × same template = the template becomes entity-independent.
      
  → Because trap inoculation prevents exam-day errors
  
    WHY do specific traps need dedicated drilling?
    → Because traps exploit PLAUSIBLE WRONG ANSWERS.
      The wrong answer feels right. The only defense: drill the trap
      so many times that the wrong answer feels physically wrong.
      
WHY can't this be done with fewer than ~4,000 cards?

  → Each bedrock needs ~50 encounters to automate
  → 82 bedrocks × 50 encounters = 4,100 encounters
  → This matches cognitive science research on skill acquisition:
     ~50 retrieval attempts for procedure automaticity
  → Cutting to 2,000 = only 25 encounters per bedrock
     = verified but not automated = vulnerable to stress regression on exam day
     
WHY must cards be hand-authored, not AI-generated at runtime?

  → Accuracy: hand-authored cards are verified correct. AI cards may have bugs
     in traces, wrong answers in MCQs, or nonsensical distractors.
  → Exam-alignment: hand-authored cards are checked against actual Test 2 format.
  → No network dependency: works offline, on phone, on exam-day morning.
  → Trust: student trusts the app is CORRECT. One wrong card = doubt in all cards.

WHY linear and not adaptive/branching?

  → Linear removes decision fatigue. Student just walks forward.
  → Linear guarantees EVERY bedrock is encountered (adaptive might skip).
  → Linear makes progress visible: "card 2,847 of 4,000 = 71% done."
  → Failure routing still exists: fail a card → retry or drop to easier type.
     But you don't CHOOSE your path. The path is fixed. You just walk it.
```

---

# PART 6 — THE BEDROCK DEPENDENCY GRAPH

Which bedrocks must be learned BEFORE which others?

```
LAYER 0 BEDROCKS (no prerequisites — absolute foundations):
  Q1-B01 (what hand-execute means)
  Q1-B02 (C++ is not English)
  Q1-B03 (const)
  Q1-B04 (int)
  Q1-B06 (= is assignment)
  Q1-B07 (right-side-first)
  Q1-B08 (;)
  Q1-B12 (double)
  Q1-B24 (uninitialized declaration)
  X-B01 (wrong > blank)

LAYER 1 BEDROCKS (require Layer 0):
  Q1-B13 (arrays) ← requires int, variable concept
  Q1-B14 ([] in declaration) ← requires arrays
  Q1-B15 (zero-indexed) ← requires arrays
  Q3-B06 (cin) ← requires variables
  Q3-B07 (>> direction) ← requires cin
  Q4-B01 (prompt-read pair) ← requires cout, cin
  Q4-B10 (endl) ← requires cout
  Q4-B11 (<< chaining) ← requires cout

LAYER 2 BEDROCKS (require Layer 1):
  Q1-B31 (comparison → boolean) ← requires types
  Q1-B33 (if statement) ← requires boolean
  Q1-B35 (strict >) ← requires comparison
  Q1-B36 (if false → skip) ← requires if
  Q1-B28 (for-loop syntax) ← requires ;, variables
  Q1-B29 (for-loop execution order) ← requires for-loop syntax
  Q1-B30 (i++) ← requires assignment
  Q1-B32 (loop exit value) ← requires for-loop execution order
  Q1-B37 (accumulator pattern) ← requires assignment, loops
  Q1-B38 (right→left execution) ← requires assignment
  Q1-B52 (algorithm patterns) ← requires loops, if, accumulator

LAYER 3 BEDROCKS (require Layer 2):
  Q1-B09 (struct syntax) ← requires types, ;
  Q1-B10 (struct = bundle) ← requires variables
  Q1-B16 (}; discrimination) ← requires struct, code blocks
  Q1-B25 (dot field access) ← requires structs
  Q1-B39 (brace-init) ← requires structs, arrays
  Q1-B40 (nested braces) ← requires brace-init
  Q1-B41 (brace-init result) ← requires nested braces
  Q1-B42 (unary minus) ← requires numeric literals
  Q1-B34 (composite access) ← requires arrays, structs, dot
  Q2-B01 (struct template) ← requires struct syntax
  Q2-B05 (};) ← requires struct syntax
  Q4-B09 (composite access for output) ← requires arrays, structs, dot

LAYER 4 BEDROCKS (require Layer 3):
  Q1-B18 (function) ← requires code blocks
  Q1-B19 (function call) ← requires function
  Q1-B20 (parameter) ← requires function
  Q1-B21 (& = reference) ← requires parameter, variables
  Q1-B22 (without & = copy) ← requires &
  Q1-B23 (& at definition not call) ← requires &
  Q1-B43 (call syntax) ← requires function
  Q1-B44 (argument binding) ← requires parameter, &
  Q3-B01 (array param syntax) ← requires arrays, &
  Q3-B03 (why &) ← requires &
  Q4-B03 (call syntax) ← requires function
  Q4-B04 (no & at call site) ← requires Q1-B23
  Q4-B06 (array name = argument) ← requires arrays, function call

LAYER 5 BEDROCKS (require ALL of Layers 0-4):
  Q1-B26 (overwrite destroys old value) ← requires assignment, &, function call
  Q1-B27 (function can overwrite init) ← requires Q1-B26, brace-init
  Q1-B45 (trace algorithm) ← requires ALL of control flow + compound types + functions
  Q1-B46 (working memory offload) ← requires trace concept
  Q1-B47 (function call in trace) ← requires trace + function call
  Q1-B48 (loop trace method) ← requires trace + loops
  Q1-B49 (overwrite trap) ← requires Q1-B26, Q1-B27
  Q1-B50 (strict comparison trap) ← requires Q1-B35
  Q1-B51 (off-by-one trap) ← requires Q1-B32

LAYERS 6-8 BEDROCKS (Q-specific, require Layers 0-5):
  Q2-B02 through Q2-B10 ← require structs + naming
  Q3-B04 through Q3-B13 ← require functions + & + arrays + structs
  Q4-B02 through Q4-B13 ← require everything

LAYER 9 BEDROCKS (integration, require ALL):
  X-B02 through X-B06 ← require mastery of all 4 Qs
  Q2-B09 (cross-Q coupling) ← requires Q2 + Q3 + Q4
  Q3-B13 (field name match) ← requires Q2 + Q3
  Q4-B13 (field name match) ← requires Q2 + Q4
  Q4-B08 (desk_num 3-place audit) ← requires full Q4
```

---

# PART 7 — VIABILITY ASSESSMENT

## Is 4,000 hand-authored cards feasible?

| Factor | Analysis |
|---|---|
| Authoring time | ~3 min per card (template-based) = ~200 hours |
| Authoring approach | Templates reduce to slot-fill: 8 entities × N card shapes |
| Quality control | Each card verified against actual Test 2 format |
| Current state | 2,528 cards exist. Gap = ~1,472 new cards. |
| Existing coverage | ~60% of bedrocks already covered. ~40% need new cards. |
| Timeline | 6 days until May 14 resit. ~1,472 cards ÷ 6 days = ~245 cards/day to author |
| Realistic? | With AI-assisted authoring (build-time, verified): yes. Pure hand: tight. |

## Does the WHY→HOW card structure actually work?

| Question | Answer |
|---|---|
| Does every card map to a bedrock? | Yes — every card installs/verifies/automates exactly one. |
| Does the linear order respect dependencies? | Yes — dependency graph in Part 6 guarantees. |
| Does 82 bedrocks × ~50 encounters = mastery? | Consistent with deliberate practice research. |
| Does this cover ALL epistemological types? | 14 types identified. Each has dedicated card types. |
| Can a student complete 4,000 cards in 7 days? | ~570 cards/day. At ~1 min/card = ~10 hours/day. Aggressive but possible. |
| What if they can't do 10 hours/day? | Cut spaced reps (Layer 10) to ~500. Total ~3,000. ~430/day = ~7 hours. |

## The core insight

The problem was never features, engines, or UI. The problem is:

**82 bedrocks × 3 phases × enough repetitions = mastery.**

Every card is a terminal WHY→HOW unit.  
Every atom answers one bedrock question.  
The linear walk installs them in dependency order.  
Spaced repetition prevents forgetting.  
Entity variants prevent slot fusion.  
Trap inoculation prevents exam-day errors.  

The app is a **4,000-step proof that a blank slate can master Test 2.**

Each card is one step in that proof.

---

# APPENDIX — COMPLETE BEDROCK REGISTRY

## Q1 Bedrocks (54)

| ID | Bedrock statement | Type |
|---|---|---|
| Q1-B01 | Hand execute = draw variable boxes, walk line-by-line, update, report | PROC |
| Q1-B02 | C++ looks like English but is NOT. Every token has precise meaning. | META |
| Q1-B03 | const = value frozen at initialization | LEX |
| Q1-B04 | int = whole numbers (5, -3, 0) | LEX |
| Q1-B05 | UPPER_CASE = programmer constant, lowercase reserved = keywords | DISC |
| Q1-B06 | = is ASSIGNMENT not equality. Store right INTO left. Destroys old value. | NEG |
| Q1-B07 | Right side computed FIRST, result stored into left SECOND | SEM |
| Q1-B08 | ; ends every statement. Missing = compile error. | SYN |
| Q1-B09 | struct NAME { TYPE field; }; | SYN |
| Q1-B10 | struct = bundle values under one name. Creates a new TYPE. | SEM |
| Q1-B11 | Unfamiliar names = programmer-chosen. Read surrounding code for definition. | DISC |
| Q1-B12 | double = decimal numbers (3.14, -0.9) | LEX |
| Q1-B13 | array = numbered row of boxes, all same type | SEM |
| Q1-B14 | TYPE name[N] in declaration = array of N elements | SYN |
| Q1-B15 | Zero-indexed: first=[0], last=[N-1] | SEM |
| Q1-B16 | } = end code block. }; = end struct definition. | DISC |
| Q1-B17 | void = returns nothing | LEX |
| Q1-B18 | function = named reusable code block | SEM |
| Q1-B19 | calling = pause, jump in, run, jump back | PROC |
| Q1-B20 | parameter = named input slot, filled by argument at call time | SEM |
| Q1-B21 | & in param list = alias. Two names, one storage. Changes visible. | SEM |
| Q1-B22 | WITHOUT & = copy. Changes die when function returns. | COUNTER |
| Q1-B23 | & in DEFINITION only. NO & at call site. | DISC |
| Q1-B24 | int i; = garbage until assigned | SEM |
| Q1-B25 | . = reach inside struct, access named field | SYN |
| Q1-B26 | Assignment DESTROYS old value permanently | SEM |
| Q1-B27 | Functions can overwrite initialization values | SEM |
| Q1-B28 | for (INIT; TEST; INCREMENT) { BODY } | SYN |
| Q1-B29 | Execution: init → test → body → inc → test → ... → test(false) → exit | PROC |
| Q1-B30 | i++ = add 1 to i | LEX |
| Q1-B31 | Comparison produces true/false. true → continue, false → exit/skip. | SEM |
| Q1-B32 | After loop exit, counter = first FAILING value (i=5 after i<5) | SEM |
| Q1-B33 | if (cond) { body } = run body ONLY when true | SEM |
| Q1-B34 | data.numbers[i] = struct → field → index (3 operations chained) | COMP |
| Q1-B35 | > is STRICT. 0 > 0 = false. | SEM |
| Q1-B36 | if false → skip body, jump past } | PROC |
| Q1-B37 | x = x + y : accumulator pattern (running total) | PAT |
| Q1-B38 | Right side evaluated first in assignment (right → left direction) | SPAT |
| Q1-B39 | Brace-init fills fields in declaration order | SYN |
| Q1-B40 | Nested braces: outer = struct, inner = array | SYN |
| Q1-B41 | d.numbers[0]=2.4, ..., d.mystery=-0.9 | SEM |
| Q1-B42 | Unary minus (-0.9) = negative literal, NOT subtraction | DISC |
| Q1-B43 | name(args); = function call | SYN |
| Q1-B44 | At call: argument fills parameter. With &: they ARE the same. | SEM |
| Q1-B45 | Trace algorithm: list vars → init → walk lines → update → report | PROC |
| Q1-B46 | Brain holds ~7 items, trace has 9+. Table = external brain. | META |
| Q1-B47 | Function call in trace: draw line, note alias, trace body, note return | PROC |
| Q1-B48 | Loop trace: one row per iteration, same columns, different values | PROC |
| Q1-B49 | TRAP: data.mystery=0.0 overwrites -0.9. Start from 0, not -0.9. | SEM |
| Q1-B50 | TRAP: > 0 excludes zero. 0 > 0 = false. | SEM |
| Q1-B51 | TRAP: loop runs 5 times (i=0..4). After exit i=5. | SEM |
| Q1-B52 | Pattern: sum-of-positives. Positives={2.4,3.0,2.0}. Sum=7.4. | PAT |
| Q1-B53 | Perfectionism freeze: wrong > blank. Write something. | META |
| Q1-B54 | False proximity: code looks readable but isn't. Don't stare, move on. | META |

## Q2 Bedrocks (10)

| ID | Bedrock statement | Type |
|---|---|---|
| Q2-B01 | Struct template: struct NAME { TYPE field; }; | GEN |
| Q2-B02 | Type heuristic: id→int, count→int, text→string, decimal→double | SEM |
| Q2-B03 | snake_case: spaces→underscores, all lowercase | SYN |
| Q2-B04 | Count spec items = count fields. (1),(2),(3) = exactly 3. | PROC |
| Q2-B05 | }; after struct — semicolon mandatory, most forgotten char | SYN |
| Q2-B06 | } alone = code block. }; = struct definition. | DISC |
| Q2-B07 | Exam language: "data structure" = struct | LEX |
| Q2-B08 | Struct name = exact match to spec: "named desk_data" → desk_data | PROC |
| Q2-B09 | Q2 field names propagate to Q3 cin + Q4 cout. Typo cascades. | REL |
| Q2-B10 | Write 20+ practice structs for muscle memory | GEN |

## Q3 Bedrocks (13)

| ID | Bedrock statement | Type |
|---|---|---|
| Q3-B01 | TYPE &name[] = array by reference, empty [] = unknown size | SYN |
| Q3-B02 | Empty [] → need count parameter → that's WHY two params | SEM |
| Q3-B03 | & because function must modify array and changes must persist | SEM |
| Q3-B04 | Count param = loop bound. NOT MAX. | SEM |
| Q3-B05 | Read body template: int i; for(i<count){cin>>arr[i].field;} | GEN |
| Q3-B06 | cin >> x = pause, read keyboard, store into x | SEM |
| Q3-B07 | >> points data direction: FROM keyboard INTO variable | SPAT |
| Q3-B08 | << is cout (output). >> is cin (input). Direction = data flow. | DISC |
| Q3-B09 | cin>>arr[i].field = index→dot→field, 3 operations chained | COMP |
| Q3-B10 | array[index].field — index FIRST, dot SECOND | COMP |
| Q3-B11 | Read function = cin only. NO cout prompts in body. | NEG |
| Q3-B12 | Loop bound = count_param, not SIZE/MAX/hardcoded | SEM |
| Q3-B13 | Field names must match Q2 exactly. Look back before writing. | REL |

## Q4 Bedrocks (13)

| ID | Bedrock statement | Type |
|---|---|---|
| Q4-B01 | Prompt-read pair: cout<<prompt; cin>>var; ALWAYS together. | PAT |
| Q4-B02 | Read skeleton to find variable name. Comment hints which one. | PROC |
| Q4-B03 | Function call: name(arg1, arg2); | SYN |
| Q4-B04 | & at DEFINITION only. NO & at call site. | DISC |
| Q4-B05 | MAX=capacity, desk_num=actual. Pass desk_num, not MAX. | SEM |
| Q4-B06 | Array argument = just the name. Not arr[], not &arr. | SYN |
| Q4-B07 | Print loop: for(i<desk_num){cout<<label<<arr[i].field<<endl;} | GEN |
| Q4-B08 | desk_num appears EXACTLY 3 times: cin, call, loop bound | PROC |
| Q4-B09 | desks[i].field = composite access, index FIRST then dot | COMP |
| Q4-B10 | endl = newline | LEX |
| Q4-B11 | << chaining: cout << a << b << c | SYN |
| Q4-B12 | return 0; = last line of main = success exit | SYN |
| Q4-B13 | cout field names match Q2 exactly. Glance back. | REL |

## Cross-cutting Bedrocks (6)

| ID | Bedrock statement | Type |
|---|---|---|
| X-B01 | Wrong > blank. Always. Write something. | META |
| X-B02 | Order: Q2 → Q4 → Q3 → Q1. Pre-decided. | PROC |
| X-B03 | Budget: Q2=10, Q4=30, Q3=25, Q1=25. Write on margin. | PROC |
| X-B04 | One Q failure ≠ all failure. Qs are independent. | META |
| X-B05 | If stuck: write partial, move on, come back. | PROC |
| X-B06 | False proximity trap: if 5min pass with no writing, switch Qs. | META |

---

**TOTAL: 96 bedrocks (82 unique after dedup). 14 epistemological types. ~4,000 cards to install them all. Linear walk. No features. Just content.**
