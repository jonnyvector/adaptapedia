---
description: Review TypeScript and Python type safety
allowed-tools: [Read, Grep, Task, Bash]
argument-hint: <file or directory>
---

Review type safety in $ARGUMENTS and check for:

**TypeScript (Frontend):**
- Strict mode enabled, no `any` types used
- All function parameters and return types explicitly typed
- Interface/type definitions for all API responses
- Proper type narrowing and type guards
- No type assertions (`as`) unless absolutely necessary
- Generic types used appropriately

**Python (Backend):**
- Type hints on all function signatures
- Return types specified for all functions
- Proper use of Optional, Union, List, Dict types
- Type hints for class attributes
- Consistency with Pydantic/DRF serializers

**API Contract Consistency:**
- Frontend TypeScript interfaces match backend serializers
- API responses properly typed on both ends
- Consistent naming conventions across stack
- No type mismatches in data flow

**Type Safety Best Practices:**
- Discriminated unions for variant types
- Const assertions for literal types
- Avoiding implicit any
- Type-safe error handling

Run type checks:
- Frontend: `npm run type-check`
- Backend: `mypy` (if configured)

Report any type safety violations and provide corrections.
