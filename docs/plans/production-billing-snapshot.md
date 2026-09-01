# Production billing snapshot

**Exported:** 2025-09-01 (Supabase SQL — see `export-production-billing.sql`)

## Clients

| id | name | default_hourly_rate | retainer_enabled | retainer_hours/mo | retainer_rate | overage_rate |
|----|------|---------------------|------------------|-------------------|---------------|--------------|
| `bb05eb7e-5726-45db-8915-6149365544e4` | Fluid Resource Managment | $150 | yes | 40 | $150 | $175 |
| `c4398661-03e1-43ba-80d0-ac35a842d591` | Wiere Weddings | $150 | no | — | — | — |

## Projects

| id | client | project | hourly_rate | billable | archived |
|----|--------|---------|-------------|----------|----------|
| `fd28d43e-5eb4-4938-b8a4-22b440ef911c` | Fluid Resource Managment | Hero Builder | $0 | no | no |
| `32096433-4aed-421d-a0e8-d54aeaf58cea` | Wiere Weddings | Wiere Weddings | $0 | yes | no |

## Uninvoiced billable time

| client | project | entries | hours |
|--------|---------|---------|-------|
| Fluid Resource Managment | Hero Builder | 59 | 68.28 |

Wiere Weddings has no uninvoiced billable entries at time of export.

## Raw JSON

<details>
<summary>Clients</summary>

```json
[
  {
    "id": "bb05eb7e-5726-45db-8915-6149365544e4",
    "name": "Fluid Resource Managment",
    "default_hourly_rate": "150.00",
    "retainer_enabled": true,
    "retainer_hours_per_month": "40.00",
    "retainer_hourly_rate": "150.00",
    "retainer_overage_rate": "175.00"
  },
  {
    "id": "c4398661-03e1-43ba-80d0-ac35a842d591",
    "name": "Wiere Weddings",
    "default_hourly_rate": "150.00",
    "retainer_enabled": false,
    "retainer_hours_per_month": null,
    "retainer_hourly_rate": null,
    "retainer_overage_rate": null
  }
]
```

</details>

<details>
<summary>Projects</summary>

```json
[
  {
    "id": "fd28d43e-5eb4-4938-b8a4-22b440ef911c",
    "client_id": "bb05eb7e-5726-45db-8915-6149365544e4",
    "client_name": "Fluid Resource Managment",
    "name": "Hero Builder",
    "hourly_rate": "0.00",
    "billable": false,
    "archived": false
  },
  {
    "id": "32096433-4aed-421d-a0e8-d54aeaf58cea",
    "client_id": "c4398661-03e1-43ba-80d0-ac35a842d591",
    "client_name": "Wiere Weddings",
    "name": "Wiere Weddings",
    "hourly_rate": "0.00",
    "billable": true,
    "archived": false
  }
]
```

</details>
