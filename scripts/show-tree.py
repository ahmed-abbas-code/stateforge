#!/usr/bin/env python3
import sys, os, collections

T = lambda: collections.defaultdict(T)
root = T()

for line in sys.stdin:
    parts = line.strip().split("/")
    node = root
    for part in parts[:-1]:
        node = node[part]
    node[parts[-1]] = None

def draw(node, prefix=""):
    entries = sorted(node.items(), key=lambda x: (x[1] is None, x[0]))
    for i, (name, child) in enumerate(entries):
        last = i == len(entries) - 1
        branch = "└── " if last else "├── "
        print(f"{prefix}{branch}{name}")
        if child is not None:
            draw(child, prefix + ("    " if last else "│   "))

draw(root)
