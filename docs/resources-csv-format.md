# Resources CSV Format

## `resources.csv`

Required header columns:

- `ID`
- `Name`
- `Category` (`labor`, `equipment`, or `material`)
- `Unit`
- `Capacity` (number)
- `CostRate` (number)
- `Color` (optional)

Example:

```csv
ID,Name,Category,Unit,Capacity,CostRate,Color
r1,Concrete Crew,labor,hours,8,95,#3A7D5B
r2,Tower Crane,equipment,days,1,650,#2E6CB8
r3,Concrete,material,tons,0,120,#B8860B
```

Notes:

- `Category` must be one of the three allowed values.
- `Capacity` and `CostRate` must parse as finite numbers.
- Missing `Color` will be auto-assigned from the app palette.

## `assignments.csv`

Required header columns:

- `ID`
- `TaskID`
- `ResourceID`
- `Quantity` (must be `> 0`)
- `Notes` (optional)

Example:

```csv
ID,TaskID,ResourceID,Quantity,Notes
a1,t-foundation,r1,6,day shift
a2,t-crane-pour,r2,1,
a3,t-concrete-pour,r3,22,first lift
```

Notes:

- `Quantity` must be a positive number.
- Rows with invalid required fields are skipped and reported.
- After import, assignments pointing to missing tasks/resources are pruned as orphan references.
