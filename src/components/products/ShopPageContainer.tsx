"use client";
import React, { Suspense, useState, useMemo } from "react";
import ProductViewChange from "../product/ProductViewChange";
import Pagination from "../others/Pagination";
import SingleProductListView from "@/components/product/SingleProductListView";
import { Product } from "@/types";
import SingleProductCartView from "../product/SingleProductCartView";
import Loader from "../others/Loader";

interface ShopPageContainerProps {
  products: Product[];
  page?: string;
  gridColumn?: number;
}

const ITEMS_PER_PAGE = 12;

const ShopPageContainer = ({ products, page = "1" }: ShopPageContainerProps) => {
  const [listView, setListView] = useState(false);

  const currentPage = Math.max(1, Number(page) || 1);
  const totalPages  = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginated   = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  if (paginated.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center flex-col gap-4 text-xl mx-auto font-semibold">
        <ProductViewChange
          listView={listView}
          setListView={setListView}
          totalPages={totalPages}
          itemPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
        />
        <p>Désolé, aucun résultat trouvé avec votre sélection de filtres</p>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-0 w-full">
      <ProductViewChange
        listView={listView}
        setListView={setListView}
        totalPages={totalPages}
        itemPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
      />

      {listView ? (
        <div className="w-full overflow-hidden py-4 md:py-8 gap-4 lg:gap-6">
          {paginated.map((product) => (
            <SingleProductListView key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="w-full overflow-hidden py-4 md:py-8 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {paginated.map((product) => (
            <SingleProductCartView key={product.id} product={product} />
          ))}
        </div>
      )}

      <Suspense fallback={<Loader />}>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          pageName="page"
        />
      </Suspense>
    </div>
  );
};

export default ShopPageContainer;
