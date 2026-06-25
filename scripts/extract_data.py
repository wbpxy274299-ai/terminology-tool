# 数据提取脚本：从原始 HTML 中提取 TERMS 数组，导出为 JSON
import re
import json
import os

INPUT_FILE = os.path.join(os.path.dirname(__file__), '..', '术语校对工具_多语言聚合版.html')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'terms.json')

print('正在读取原始 HTML 文件...')
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

print('正在提取 TERMS 数据...')
m = re.search(r'TERMS\s*=\s*(\[[\s\S]*?\]);', content)
if not m:
    print('错误：未找到 TERMS 数组')
    exit(1)

data = json.loads(m.group(1))
print(f'提取到 {len(data)} 条术语')

# 转为更紧凑的 JSON 格式
# 原始格式: [cn, jp, en, kr, tw, vn, id, th, cat, key, note]
# 保留原格式，但去掉空字段尾部
cleaned = []
for row in data:
    # 去掉尾部的空字符串
    while len(row) > 1 and (row[-1] == '' or row[-1] is None):
        row.pop()
    cleaned.append(row)

output_path = os.path.normpath(OUTPUT_FILE)
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, ensure_ascii=False, separators=(',', ':'))

size_mb = os.path.getsize(output_path) / 1024 / 1024
print(f'已导出到: {output_path}')
print(f'文件大小: {size_mb:.2f} MB')
print('完成！')
