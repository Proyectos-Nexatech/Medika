import json

log_path = r'C:\Users\EQC0670\.gemini\antigravity\brain\7a14c272-e794-46ae-8175-426fe075134d\.system_generated\logs\transcript_full.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'invoke_subagent' in line and 'packages/shared' in line:
            data = json.loads(line)
            for tc in data.get('tool_calls', []):
                args = tc.get('arguments', tc.get('args', {}))
                for sa in args.get('Subagents', []):
                    prompt = sa.get('Prompt', '')
                    if 'packages/shared' in prompt:
                        print("Prompt length:", len(prompt))
                        idx = prompt.find('c:\\Users')
                        if idx != -1:
                            print("Context around path:")
                            print(repr(prompt[max(0, idx-20):idx+50]))
            break
