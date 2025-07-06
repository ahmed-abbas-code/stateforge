#!/usr/bin/env python3
import sys
import collections

T = lambda: collections.defaultdict(T)
root = T()

for line in sys.stdin:
    parts = [p for p in line.strip().split("/") if p]  # skip empty parts
    node = root
    for part in parts[:-1]:
        if not isinstance(node[part], dict):
            node[part] = T()
        node = node[part]
    node[parts[-1]] = T()  # assign a dict instead of None to keep it traversable

def draw(node, prefix=""):
    entries = sorted(node.items(), key=lambda x: (not x[1], x[0]))  # dirs first
    for i, (name, child) in enumerate(entries):
        last = i == len(entries) - 1
        branch = "└── " if last else "├── "
        print(f"{prefix}{branch}{name}")
        if child:
            draw(child, prefix + ("    " if last else "│   "))

draw(root)
