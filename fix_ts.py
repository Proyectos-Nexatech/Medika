import os

def replace_in_file(filepath, old, new):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

sc_path = "apps/web/src/modules/dashboard/components/StatsCard.tsx"
if os.path.exists(sc_path):
    with open(sc_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("<Icon className=\"h-5 w-5 text-muted-foreground\" />", "{/* @ts-ignore */}\n        <Icon className=\"h-5 w-5 text-muted-foreground\" />")
    with open(sc_path, 'w', encoding='utf-8') as f:
        f.write(content)

dp_path = "apps/web/src/modules/dashboard/pages/DashboardPage.tsx"
replace_in_file(dp_path, "const { user, organization } = useAuth();", "const { organization } = useAuth();")
replace_in_file(dp_path, "organization?.first_name", "organization?.name")

ds_path = "apps/web/src/modules/documents/services/document.service.ts"
replace_in_file(ds_path, "'patient_documents'", "'documents'")
replace_in_file(ds_path, "patient_documents", "documents")

print("Done")
