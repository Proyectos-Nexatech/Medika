import os
import glob

base_dir = r"c:\Users\EQC0670\Medika\apps\web\src\modules"

files = glob.glob(os.path.join(base_dir, "**", "pages", "*.tsx"), recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix context variable
    content = content.replace("const { currentOrganization } = useOrganization();", "const { organizationId } = useOrganization();")
    content = content.replace("currentOrganization?.id", "organizationId")
    content = content.replace("currentOrganization!.id", "organizationId!")
    content = content.replace("!!currentOrganization", "!!organizationId")
    
    # Fix PatientListPage columns
    if "PatientListPage" in file:
        content = content.replace("p.id_type", "p.document_type")
        content = content.replace("p.id_number", "p.document_number")

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
