# Critical Path Method (CPM) & Scheduling Engine
## Mathematical Formulation, Forward/Backward Passes, and Float Analysis

**Ministry of Statistics & Programme Implementation (MoSPI)**  
*ProjectPulse Infrastructure Risk Intelligence & Execution Platform*

---

## 1. Mathematical Formulation

Let the project execution network be represented by a Directed Acyclic Graph (DAG) $G = (V, E)$, where each vertex $v_i \in V$ represents an execution task with duration $d_i \in \mathbb{Z}^+$, and each directed edge $(v_i, v_j) \in E$ represents a finish-to-start predecessor constraint requiring $v_i$ to complete before $v_j$ can start.

### 1.1 Forward Pass (Earliest Times Calculation)
The forward pass calculates the earliest start time ($ES_i$) and earliest finish time ($EF_i$) for every task:

$$
ES_i = \begin{cases} 
0, & \text{if } \text{Pred}(v_i) = \emptyset \\
\max_{v_p \in \text{Pred}(v_i)} EF_p, & \text{otherwise}
\end{cases}
$$

$$
EF_i = ES_i + d_i
$$

The project total duration $T_{\text{project}}$ is defined by the maximum early finish of all terminal tasks:

$$
T_{\text{project}} = \max_{v_i \in V} EF_i
$$

### 1.2 Backward Pass (Latest Times Calculation)
The backward pass traverses the graph in reverse topological order from terminal nodes to determine latest finish ($LF_i$) and latest start ($LS_i$):

$$
LF_i = \begin{cases} 
T_{\text{project}}, & \text{if } \text{Succ}(v_i) = \emptyset \\
\min_{v_s \in \text{Succ}(v_i)} LS_s, & \text{otherwise}
\end{cases}
$$

$$
LS_i = LF_i - d_i
$$

### 1.3 Float & Critical Path Identification
The **Total Float** ($TF_i$) of a task represents the maximum delay that can be absorbed without postponing project completion:

$$
TF_i = LF_i - EF_i = LS_i - ES_i
$$

The **Free Float** ($FF_i$) represents the delay that can occur without affecting the early start of any immediate successor:

$$
FF_i = \min_{v_s \in \text{Succ}(v_i)} ES_s - EF_i
$$

A task $v_i$ is defined as **Critical** if and only if its total float is zero:

$$
\text{is\_critical}(v_i) = \begin{cases} 
1, & \text{if } TF_i = 0 \\
0, & \text{if } TF_i > 0 
\end{cases}
$$

The sequence of critical tasks from project start to finish forms the **Critical Path**. Any delay on a critical task translates $1:1$ into overall project completion slippage.

---

## 2. Downstream Delay Propagation
When an active task $v_k$ experiences an unplanned stoppage of $\Delta t$ days:
1. If $TF_k \ge \Delta t$, the slippage is absorbed within the task's schedule buffer; the project deadline remains unchanged, but downstream successors' float is diminished:
   $$TF_{\text{new}}(v_k) = TF_{\text{old}}(v_k) - \Delta t$$
2. If $TF_k < \Delta t$, the float is exhausted ($TF_{\text{new}} = 0$), and an unabsorbed delay of $\delta = \Delta t - TF_k$ propagates through all successor nodes along the critical chain:
   $$\forall v_s \in \text{Chain}(v_k), \quad ES_{\text{new}}(v_s) = ES_{\text{old}}(v_s) + \delta$$
   $$\Delta T_{\text{project}} = \delta$$

---

## 3. Dynamic Recovery Rescheduling Simulator
When a critical path delay occurs, the scheduler evaluates 5 recovery strategies:

1. **Fast-Tracking**: Identifies sequential dependencies on the critical path that can be converted into concurrent or partially overlapping activities (e.g., casting bridge segments in precast yard concurrently with foundation well sinking).
2. **Crashing**: Adds resources, heavy machinery, or specialized contractors to the critical task to reduce duration $d_i$ at minimum marginal cost $\frac{\Delta C}{\Delta t}$.
3. **Shift Optimization**: Transitions single-shift site rosters into 24/7 2-shift or 3-shift continuous operations.
4. **Scope Phasing**: Divides the project into commissioning stages, opening critical sections (e.g. 2 lanes of a 6-lane corridor) ahead of schedule.
5. **Buffering**: Absorbs non-critical float in parallel pavement/signage packages to prioritize substructure works.
