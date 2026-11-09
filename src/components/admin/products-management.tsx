import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  History,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { adminProductService } from "@/services/admin-product.service";
import AddProductDialog from "@/components/admin/add-product-dialog";
import EditProductDialog from "@/components/admin/edit-product-dialog";
import AdjustStockDialog from "@/components/admin/adjust-stock-dialog";
import type { BackendProduct } from "@/services/product.service";
import {
  inventoryService,
  type InventoryProduct,
  type InventoryAdjustment,
  type InventoryStatus,
  type InventoryAdjustmentType,
} from "@/services/inventory.service";

const categories = [
  "Bone Straight",
  "Bouncy(Vietnam and Chinese)",
  "Deep Wave",
  "Pixie Curls",
  "Raw donors",
  "Babytin",
  "Burmese curls",
  "Custom Wigs",
];

const PAGE_SIZE = 10;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ProductsManagement() {
  const [activeTab, setActiveTab] = useState("products");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BackendProduct | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<InventoryProduct | null>(null);

  // Product listing state
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [productStatus, setProductStatus] = useState<"all" | "active" | "inactive">("all");
  const [productPage, setProductPage] = useState(1);
  const [productPages, setProductPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Inventory state
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryStatus, setInventoryStatus] = useState<"all" | InventoryStatus>("all");
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPages, setInventoryPages] = useState(1);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  // Adjustment history state
  const [history, setHistory] = useState<InventoryAdjustment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyType, setHistoryType] = useState<"all" | InventoryAdjustmentType>("all");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductError("");

    try {
      const response = await adminProductService.list({
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(category !== "all" ? { category } : {}),
        status: productStatus,
        page: productPage,
        limit: PAGE_SIZE,
        sort: "newest",
      });

      setProducts(response.products);
      setTotalProducts(response.totalProducts);
      setProductPages(Math.max(1, response.totalPages));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load products.";

      setProductError(message);
    } finally {
      setLoadingProducts(false);
    }
  }, [search, category, productStatus, productPage]);

  const handleProductStatusChange = async (product: BackendProduct) => {
    const action = product.isActive ? "deactivate" : "reactivate";

    const confirmed = window.confirm(`Are you sure you want to ${action} "${product.name}"?`);

    if (!confirmed) return;

    try {
      if (product.isActive) {
        await adminProductService.deactivate(product._id);
        toast.success("Product deactivated successfully.");
      } else {
        await adminProductService.reactivate(product._id);
        toast.success("Product reactivated successfully.");
      }

      await loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Unable to ${action} product.`);
    }
  };

  const loadInventory = useCallback(async () => {
    setLoadingInventory(true);

    try {
      const response = await inventoryService.list({
        ...(inventorySearch.trim() ? { search: inventorySearch.trim() } : {}),
        ...(inventoryStatus !== "all" ? { status: inventoryStatus } : {}),
        page: inventoryPage,
        limit: PAGE_SIZE,
      });

      setInventory(response.inventory);
      setInventoryPages(Math.max(1, response.totalPages));
      setLowStockThreshold(response.lowStockThreshold);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load inventory.");
    } finally {
      setLoadingInventory(false);
    }
  }, [inventorySearch, inventoryStatus, inventoryPage]);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);

    try {
      const response = await inventoryService.getHistory({
        ...(historyType !== "all" ? { adjustmentType: historyType } : {}),
        page: historyPage,
        limit: PAGE_SIZE,
      });

      setHistory(response.adjustments);
      setHistoryPages(Math.max(1, response.totalPages));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load adjustment history.");
    } finally {
      setLoadingHistory(false);
    }
  }, [historyType, historyPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInventory();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loadInventory]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const refreshCurrentTab = () => {
    if (activeTab === "products") {
      void loadProducts();
    } else if (activeTab === "inventory") {
      void loadInventory();
    } else {
      void loadHistory();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Store management
          </p>

          <h2 className="mt-2 text-3xl font-semibold">Products</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your products, inventory and stock adjustment records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={refreshCurrentTab}
            disabled={loadingProducts || loadingInventory || loadingHistory}
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>

          <Button onClick={() => setAddProductOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add product
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid h-auto w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="products">
            <ShoppingBag className="mr-2 size-4" />
            Products
          </TabsTrigger>

          <TabsTrigger value="inventory">
            <Package className="mr-2 size-4" />
            Inventory
          </TabsTrigger>

          <TabsTrigger value="history">
            <History className="mr-2 size-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* PRODUCTS */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search products..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setProductPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setProductPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>

                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={productStatus}
              onValueChange={(value) => {
                setProductStatus(value as "all" | "active" | "inactive");
                setProductPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Product status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{totalProducts} products found</span>
            <span>
              Page {productPage} of {productPages}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingProducts ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin" />
                      <span className="mt-2 block text-sm text-muted-foreground">
                        Loading products...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : productError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <AlertCircle className="mx-auto size-6 text-destructive" />
                      <p className="mt-2 text-sm text-destructive">{productError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => void loadProducts()}
                      >
                        Try again
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="size-12 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="grid size-12 place-items-center rounded-md border bg-muted">
                              <Package className="size-5 text-muted-foreground" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="max-w-48 truncate font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.variants?.length || 0} variants
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-40 truncate">{product.category}</TableCell>

                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(product.price)}
                      </TableCell>

                      <TableCell>{product.stock}</TableCell>

                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant={product.isFeatured ? "outline" : "secondary"}>
                          {product.isFeatured ? "Featured" : "Regular"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </Button>

                          <Button
                            variant={product.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => void handleProductStatusChange(product)}
                          >
                            {product.isActive ? "Deactivate" : "Reactivate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={productPage <= 1 || loadingProducts}
              onClick={() => setProductPage((page) => page - 1)}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {productPage} / {productPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={productPage >= productPages || loadingProducts}
              onClick={() => setProductPage((page) => page + 1)}
            >
              Next
            </Button>
          </div>
        </TabsContent>

        {/* INVENTORY */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Low-stock threshold</p>
              <p className="mt-1 text-2xl font-semibold">{lowStockThreshold} units</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Inventory records</p>
              <p className="mt-1 text-2xl font-semibold">{inventory.length}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search inventory..."
                value={inventorySearch}
                onChange={(event) => {
                  setInventorySearch(event.target.value);
                  setInventoryPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={inventoryStatus}
              onValueChange={(value) => {
                setInventoryStatus(value as "all" | InventoryStatus);
                setInventoryPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Stock status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All stock</SelectItem>
                <SelectItem value="IN_STOCK">In stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingInventory ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin" />
                      <span className="mt-2 block text-sm text-muted-foreground">
                        Loading inventory...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                      No inventory records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => {
                    const status =
                      item.inventoryStock === 0
                        ? "Out of stock"
                        : item.inventoryStock <= lowStockThreshold
                          ? "Low stock"
                          : "In stock";

                    return (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.name}</TableCell>

                        <TableCell>{item.category}</TableCell>

                        <TableCell className="font-semibold">{item.inventoryStock}</TableCell>

                        <TableCell>{item.variants.length}</TableCell>

                        <TableCell>
                          <Badge variant={status === "In stock" ? "default" : "destructive"}>
                            {status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdjustingProduct(item)}
                          >
                            Adjust stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={inventoryPage <= 1 || loadingInventory}
              onClick={() => setInventoryPage((page) => page - 1)}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {inventoryPage} / {inventoryPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={inventoryPage >= inventoryPages || loadingInventory}
              onClick={() => setInventoryPage((page) => page + 1)}
            >
              Next
            </Button>
          </div>
        </TabsContent>

        {/* ADJUSTMENT HISTORY */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Stock adjustment history</h3>
              <p className="text-sm text-muted-foreground">
                Records of previous inventory changes.
              </p>
            </div>

            <Select
              value={historyType}
              onValueChange={(value) => {
                setHistoryType(value as "all" | InventoryAdjustmentType);
                setHistoryPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Adjustment type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All adjustments</SelectItem>
                <SelectItem value="INCREASE">Increases</SelectItem>
                <SelectItem value="DECREASE">Decreases</SelectItem>
                <SelectItem value="SET">Stock resets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>New stock</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin" />
                      <span className="mt-2 block text-sm text-muted-foreground">
                        Loading adjustment history...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                      No stock adjustments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => {
                    const admin =
                      typeof item.adjustedBy === "string"
                        ? item.adjustedBy
                        : `${item.adjustedBy.firstName} ${item.adjustedBy.lastName}`;

                    return (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              item.adjustmentType === "INCREASE"
                                ? "default"
                                : item.adjustmentType === "DECREASE"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {item.adjustmentType}
                          </Badge>
                        </TableCell>

                        <TableCell>{item.previousStock}</TableCell>
                        <TableCell className="font-semibold">{item.newStock}</TableCell>

                        <TableCell className="max-w-48 truncate">{item.reason}</TableCell>

                        <TableCell>{admin}</TableCell>

                        <TableCell className="whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={historyPage <= 1 || loadingHistory}
              onClick={() => setHistoryPage((page) => page - 1)}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {historyPage} / {historyPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={historyPage >= historyPages || loadingHistory}
              onClick={() => setHistoryPage((page) => page + 1)}
            >
              Next
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AddProductDialog
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onSuccess={() => void loadProducts()}
      />

      <EditProductDialog
        open={Boolean(editingProduct)}
        product={editingProduct}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
        onSuccess={() => {
          setEditingProduct(null);
          void loadProducts();
        }}
      />

      <AdjustStockDialog
        open={Boolean(adjustingProduct)}
        product={adjustingProduct}
        onOpenChange={(open) => {
          if (!open) setAdjustingProduct(null);
        }}
        onSuccess={() => {
          setAdjustingProduct(null);
          void loadInventory();
          void loadHistory();
        }}
      />
    </section>
  );
}

export default ProductsManagement;
