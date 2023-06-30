export const baseColumnConfig = [
    {
        name: 'createdAt',
        type: 'datetime',
        default: 'CURRENT_TIMESTAMP',
    },
    {
        name: 'updatedAt',
        type: 'datetime',
        default: 'CURRENT_TIMESTAMP',
    },
    {
        name: 'deletedAt',
        type: 'datetime',
        default: 'null',
        isNullable: true,
    },
    {
        name: 'createdBy',
        type: 'int',
        default: 'null',
        isNullable: true,
    },
    {
        name: 'updatedBy',
        type: 'int',
        default: 'null',
        isNullable: true,
    },
    {
        name: 'deletedBy',
        type: 'int',
        default: 'null',
        isNullable: true,
    },
];
