import { useState, useEffect, useRef } from 'react';

const VIEW_TYPES = {
    HIGH_DEMAND: 'HIGH_DEMAND',
    TRENDING: 'TRENDING',
    HIGH_POTENTIAL: 'HIGH_POTENTIAL',
};

const SAMPLE_DATA: ProductRow[] = [
    {
        id: '1',
        title: 'Premium Wireless Headphones',
        subtitle: 'Noise Cancelling',
        thumbnailUrl: 'https://via.placeholder.com/40',
        currentRequests: 245,
        avgRequestAge: 3.5,
        historicalRequests: 1250,
    },
    {
        id: '2',
        title: 'USB-C Fast Charger',
        subtitle: '65W Power Delivery',
        thumbnailUrl: 'https://via.placeholder.com/40',
        currentRequests: 189,
        avgRequestAge: 2.1,
        historicalRequests: 856,
    },
    {
        id: '3',
        title: 'Portable SSD 1TB',
        subtitle: 'NVMe',
        thumbnailUrl: 'https://via.placeholder.com/40',
        currentRequests: 312,
        avgRequestAge: 4.8,
        historicalRequests: 2103,
    },
    {
        id: '4',
        title: 'Smart Watch Pro',
        subtitle: 'Fitness Tracking',
        thumbnailUrl: 'https://via.placeholder.com/40',
        currentRequests: 156,
        avgRequestAge: 1.9,
        historicalRequests: 743,
    },
    {
        id: '5',
        title: 'Mechanical Keyboard RGB',
        subtitle: 'Cherry MX Switches',
        thumbnailUrl: 'https://via.placeholder.com/40',
        currentRequests: 428,
        avgRequestAge: 5.2,
        historicalRequests: 1967,
    },
];

interface ProductRow {
    id: string;
    title: string;
    subtitle?: string;
    thumbnailUrl?: string;
    currentRequests: number;
    avgRequestAge?: number;
    historicalRequests: number;
}

interface ProductTableProps {
    data: ProductRow[];
}

const tableStyles = `
  .back-in-stock-table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .back-in-stock-table thead {
    background-color: #f5f5f5;
    border-bottom: 2px solid #e0e0e0;
  }

  .back-in-stock-table thead th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 14px;
    color: #333;
    white-space: nowrap;
  }

  .back-in-stock-table tbody tr {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;
  }

  .back-in-stock-table tbody tr:hover {
    background-color: #fafafa;
  }

  .back-in-stock-table tbody tr:last-child {
    border-bottom: none;
  }

  .back-in-stock-table td {
    padding: 12px 16px;
    font-size: 14px;
    color: #666;
  }

  .back-in-stock-table td:first-child {
    text-align: center;
  }

  .product-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .product-image {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    object-fit: cover;
    background-color: #f0f0f0;
  }

  .product-info div:first-child {
    font-weight: 500;
    color: #333;
    margin-bottom: 2px;
  }

  .product-info div:last-child {
    font-size: 12px;
    color: #999;
  }

  .metric-cell {
    text-align: center;
    font-weight: 600;
    color: #333;
  }

  .metric-cell.secondary {
    color: #666;
    font-weight: 400;
  }
`;

export default function ProductTable({ data }: ProductTableProps) {
    const [viewType, setViewType] = useState(VIEW_TYPES.HIGH_DEMAND);
    const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
    const selectAllRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log(viewType)
    }, [viewType])

    const safeData = data && data.length > 0 ? data : SAMPLE_DATA;

    useEffect(() => {
        if (!selectAllRef.current) return;
        const allSelected = safeData.length > 0 && safeData.every(row => selectedRows[row.id]);
        const someSelected = safeData.some(row => selectedRows[row.id]);
        selectAllRef.current.indeterminate = someSelected && !allSelected;
    }, [selectedRows, safeData]);

    const toggleSelect = (id: string) => {
        setSelectedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.currentTarget.checked;
        const newSelected: Record<string, boolean> = {};
        safeData.forEach(row => {
            newSelected[row.id] = checked;
        });
        setSelectedRows(newSelected);
    };

    return (
        <>
            <style>{tableStyles}</style>
            <s-stack gap="base">
                <table className="back-in-stock-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <s-checkbox
                                    ref={selectAllRef}
                                    checked={safeData.length > 0 && safeData.every(row => selectedRows[row.id])}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Product</th>
                            <th style={{ textAlign: 'center' }}>Current Requests</th>
                            <th style={{ textAlign: 'center' }}>Recent Request</th>
                            <th style={{ textAlign: 'center' }}>Total Requests</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeData.map(row => (
                            <tr key={row.id}>
                                <td>
                                    <s-checkbox
                                        checked={!!selectedRows[row.id]}
                                        onChange={() => toggleSelect(row.id)}
                                    />
                                </td>
                                <td>
                                    <div className="product-cell">
                                        {row.thumbnailUrl && (
                                            <img
                                                src={row.thumbnailUrl}
                                                alt={row.title}
                                                className="product-image"
                                            />
                                        )}
                                        <div className="product-info">
                                            <div>{row.title}</div>
                                            {row.subtitle && (
                                                <div>{row.subtitle}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="metric-cell">{row.currentRequests}</td>
                                <td className="metric-cell secondary">{row.avgRequestAge != null ? `${row.avgRequestAge}h` : '–'}</td>
                                <td className="metric-cell">{row.historicalRequests}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ paddingTop: '8px' }}>
                    <s-link href="#" tone="primary">
                        See all
                    </s-link>
                </div>
            </s-stack>
        </>
    );
}
