export interface PreviewCategory {
    id: string;
    name: string;
}

export interface PreviewProduct {
    id: string;
    category_id: string;
    categoryName: string;
    name: string;
    description: string;
    price: string;
    price_num: number;
    image_key: string;
    image_url?: string | null;
    image_path?: string | null;
    display_order: number;
    status: 'Active' | 'Featured';
}

export const previewCategories: PreviewCategory[] = [
    { id: 'preview-hot', name: 'Hot Coffee' },
    { id: 'preview-cold', name: 'Cold Coffee' },
    { id: 'preview-food', name: 'Cafe Bites' },
];

export const previewProducts: PreviewProduct[] = [
    {
        id: 'preview-latte',
        category_id: 'preview-hot',
        categoryName: 'Hot Coffee',
        name: 'Signature Latte',
        description: 'Smooth espresso finished with silky steamed milk and a light caramel note.',
        price: 'Rs. 450',
        price_num: 450,
        image_key: 'latte',
        image_url: null,
        image_path: null,
        display_order: 1,
        status: 'Featured',
    },
    {
        id: 'preview-cold-brew',
        category_id: 'preview-cold',
        categoryName: 'Cold Coffee',
        name: 'Vanilla Cold Brew',
        description: 'Slow-steeped cold brew with vanilla cream and a clean refreshing finish.',
        price: 'Rs. 520',
        price_num: 520,
        image_key: 'iced',
        image_url: null,
        image_path: null,
        display_order: 2,
        status: 'Active',
    },
    {
        id: 'preview-croissant',
        category_id: 'preview-food',
        categoryName: 'Cafe Bites',
        name: 'Butter Croissant',
        description: 'Flaky baked croissant served warm and paired perfectly with espresso drinks.',
        price: 'Rs. 280',
        price_num: 280,
        image_key: 'croissant',
        image_url: null,
        image_path: null,
        display_order: 3,
        status: 'Active',
    },
];
