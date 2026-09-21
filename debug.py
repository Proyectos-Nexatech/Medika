import json

log_path = r'C:\Users\EQC0670\.gemini\antigravity\brain\7a14c272-e794-46ae-8175-426fe075134d\.system_generated\logs\transcript_full.jsonl'

found = False
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'invoke_subagent' in line and 'packages/shared' in line:
            print("Found the line with the prompt!")
            try:
                data = json.loads(line)
                for tc in data.get('tool_calls', []):
                    args = tc.get('arguments', tc.get('args', {}))
                    if isinstance(args, str):
                        print("Arguments is a string")
                        args = json.loads(args)
                    print(f"Subagents present: {'Subagents' in args}")
            except Exception as e:
                print(f"Error parsing: {e}")
            found = True
            break
if not found:
    print("Could not find the prompt in the file.")
