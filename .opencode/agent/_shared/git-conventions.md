# Git版本控制通用规范

> 本文件为所有Agent共享的Git规范基座。各Agent的commit前缀和示例见各自Agent文件。

## 通用规则

1. **每次修改后必须commit**——不要等所有任务完成才一次性提交
2. **commit信息格式**：`[{Agent角色名}] {简述}`（各Agent使用自己的前缀）
3. **用户信息**（如未配置）：`git -c user.name="Agent" -c user.email="agent@galgame.project" commit -m "信息"`
4. **禁止force push**
5. **每次commit前**先执行 `git add -A`

## 各Agent commit前缀

| Agent | 前缀 |
|-------|------|
| 总编 | `[总编]` |
| 剧本架构师 | `[剧本架构师]` |
| 代码架构师 | `[代码架构师]` |
| 美术架构师 | `[美术架构师]` |
| 剧本-美术衔接 | `[剧本-美术衔接]` |

## 禁止事项

- ❌ 修改文件后不commit直接结束任务
- ❌ commit信息为空或过于笼统（如"update""fix"）
- ❌ 使用 `git add .` 代替 `git add -A`（可能漏删文件）
- ❌ 一个commit包含多个不相关的改动
