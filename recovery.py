import json
import re
import os

log_path = r'C:\Users\EQC0670\.gemini\antigravity\brain\7a14c272-e794-46ae-8175-426fe075134d\.system_generated\logs\transcript_full.jsonl'

files_created = 0
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'invoke_subagent' not in line: continue
        try:
            data = json.loads(line)
        except:
            continue
        
        for tc in data.get('tool_calls', []):
            args = tc.get('arguments', tc.get('args', {}))
            for sa in args.get('Subagents', []):
                prompt = sa.get('Prompt', '')
                
                matches = list(re.finditer(r"###.*?`(c:\\[^\`]+)`", prompt, re.IGNORECASE))
                
                for i, match in enumerate(matches):
                    filepath = match.group(1).strip()
                    if os.path.isdir(filepath) or not os.path.basename(filepath):
                        continue
                        
                    start_idx = match.end()
                    end_idx = matches[i+1].start() if i+1 < len(matches) else len(prompt)
                    
                    chunk = prompt[start_idx:end_idx]
                    
                    code_start = chunk.find('```')
                    if code_start == -1: continue
                    newline_after_code_start = chunk.find('\n', code_start)
                    if newline_after_code_start == -1: continue
                    content_start = newline_after_code_start + 1
                    
                    last_code_end = chunk.rfind('```')
                    if last_code_end != -1 and last_code_end > content_start:
                        file_content = chunk[content_start:last_code_end].strip()
                        
                        os.makedirs(os.path.dirname(filepath), exist_ok=True)
                        try:
                            with open(filepath, 'w', encoding='utf-8') as out_f:
                                out_f.write(file_content + '\n')
                            print(f"Created: {filepath}")
                            files_created += 1
                        except Exception as e:
                            print(f"Failed to create {filepath}: {e}")

print(f"Total files created: {files_created}")
