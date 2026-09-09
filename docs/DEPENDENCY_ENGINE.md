# Directed Acyclic Graph (DAG) & Dependency Engine
## Topological Ordering, Cycle Detection, and Predecessor Validation

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Graph Topology & Predecessor Constraints

In infrastructure construction networks, chronological and physical order are paramount (e.g. well foundations must be sunk and steined before pier caps can be poured, and piers must cure before cantilever segment launching can commence).

The dependency engine formalizes these rules in `task_dependencies`:
```sql
CREATE TABLE task_dependencies (
    dependency_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    predecessor_task_id TEXT NOT NULL,
    successor_task_id TEXT NOT NULL,
    dependency_type TEXT DEFAULT 'FS', -- FS (Finish-to-Start), SS, FF, SF
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (predecessor_task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (successor_task_id) REFERENCES tasks(task_id)
);
```

---

## 2. Rigorous Cycle Detection Algorithm

Allowing a cyclic dependency (e.g. $A \to B \to C \to A$) would cause infinite loops in CPM calculations and deadlock project execution.

The engine runs a recursive depth-first search (DFS) with a three-color node state tracking:
- **White (0)**: Unvisited node.
- **Gray (1)**: Currently visiting in recursion stack.
- **Black (2)**: Completely visited and validated.

If a transition encounters a node currently marked **Gray**, a cycle exists. The engine raises a `ValueError` indicating the exact cycle path:

```python
def validate_dag(tasks: List[str], dependencies: List[Tuple[str, str]]) -> None:
    adj = {t: [] for t in tasks}
    for pred, succ in dependencies:
        adj[pred].append(succ)

    visited = {} # 0: unvisited, 1: visiting, 2: visited
    cycle_path = []

    def dfs(node: str, path: List[str]) -> bool:
        visited[node] = 1
        path.append(node)
        for neighbor in adj.get(node, []):
            if visited.get(neighbor, 0) == 1:
                idx = path.index(neighbor)
                cycle_path.extend(path[idx:] + [neighbor])
                return True
            if visited.get(neighbor, 0) == 0:
                if dfs(neighbor, path):
                    return True
        path.pop()
        visited[node] = 2
        return False

    for t in tasks:
        if visited.get(t, 0) == 0:
            if dfs(t, []):
                raise ValueError(f"Cyclic dependency detected: {' -> '.join(cycle_path)}")
```

---

## 3. Topological Sort
Once validated as a DAG, the scheduler computes Kahn's algorithm or reverse post-order DFS to yield an in-degree ordered execution sequence. All forward passes and backward passes execute in $O(|V| + |E|)$ linear time complexity.
