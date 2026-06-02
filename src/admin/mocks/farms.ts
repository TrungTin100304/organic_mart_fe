import type { Farm } from "../../services/farmService";

export const ADMIN_FARMS: Farm[] = [
  {
    id: 1,
    name: "Green Valley Farm",
    certification: "VietGAP Organic",
    location: "Đà Lạt, Lâm Đồng",
    contactPhone: "0901000001",
    contactEmail: "farm@greenvalley.vn",
    createdAt: "2025-01-12",
  },
  {
    id: 2,
    name: "Mekong Fresh Garden",
    certification: "USDA Organic",
    location: "Cái Bè, Tiền Giang",
    contactPhone: "0901000002",
    contactEmail: "hello@mekongfresh.vn",
    createdAt: "2025-02-18",
  },
  {
    id: 3,
    name: "Sunny Herb Farm",
    certification: "Organic Standard",
    location: "Củ Chi, TP.HCM",
    contactPhone: "0901000003",
    contactEmail: "contact@sunnyherb.vn",
    createdAt: "2025-03-05",
  },
];
