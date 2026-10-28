import re,subprocess,pypdfium2 as pdfium
t=open('guide.template.html',encoding='utf8').read()
keys=re.findall(r'\{\{([\d.]+)\}\}',t)
def render(html):
    open('guide.html','w',encoding='utf8').write(html)
    subprocess.run(['node','render.cjs'],check=True,capture_output=True)
render(re.sub(r'\{\{[\d.]+\}\}','',t))
pdf=pdfium.PdfDocument('Axon-Admin-Dashboard-User-Guide.pdf')
texts=[pdf[i].get_textpage().get_text_range() for i in range(len(pdf))]
pages={}
names={'1':'Introduction','2':'Getting started','3':'The Dashboard','4':'Analytics','4.1':'Reporting period','4.3':'Audience','4.4':'Conversations','4.5':'Journeys','4.6':'AI Quality','4.7':'Performance','4.8':'Activity Logs','5':'Administration modules','6':'How do I','7':'Reference'}
for k in keys:
    pat=re.compile(r'(^|\n)\s*'+re.escape(k)+r'\s*'+re.escape(names[k]),re.I) if '.' not in k or k!='4.1' else re.compile(r'4\.1\s*Reporting period')
    for i,tx in enumerate(texts):
        if i>=2 and pat.search(tx): pages[k]=i+1; break
print(pages)
render(re.sub(r'\{\{([\d.]+)\}\}',lambda m:'p. '+str(pages.get(m.group(1),'')),t))
print(len(pdfium.PdfDocument('Axon-Admin-Dashboard-User-Guide.pdf')),'pages')
