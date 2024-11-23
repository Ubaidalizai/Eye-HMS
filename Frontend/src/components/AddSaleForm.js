import React from "react";
import { Dialog } from "@headlessui/react";

export function AddSaleForm({
  sales,
  products,
  handleInputChange,
  addNewProduct,
  isSaleValid,
  addSales,
  setOpen,
  cancelButtonRef,
  open,
}) {
  return (
    <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
      <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
        <form>
          {Array.isArray(sales) &&
            sales.map((sale, index) => (
              <div key={index} className='grid gap-4 mb-4 sm:grid-cols-2'>
                <div>
                  <label
                    htmlFor={`productRefId-${index}`}
                    className='block mb-2 text-sm font-medium text-gray-900'
                  >
                    Product Name
                  </label>
                  <select
                    id={`productRefId-${index}`}
                    name='productRefId'
                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg'
                    value={sale.productRefId}
                    onChange={(e) =>
                      handleInputChange(index, "productRefId", e.target.value)
                    }
                  >
                    <option>Select Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`quantity-${index}`}
                    className='block mb-2 text-sm font-medium text-gray-900'
                  >
                    Quantity
                  </label>
                  <input
                    type='number'
                    name='quantity'
                    id={`quantity-${index}`}
                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg'
                    value={sale.quantity}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            ))}
          <button
            type='button'
            onClick={addNewProduct}
            className='mt-3 bg-blue-600 text-white px-3 py-2 rounded-md'
          >
            Add Another Product
          </button>
        </form>
      </div>
      <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
        <button
          type='button'
          className={`inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ml-1 ${
            isSaleValid()
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-gray-300 text-gray-500"
          }`}
          disabled={!isSaleValid()}
          onClick={addSales}
        >
          Add Sale
        </button>
      </div>
    </Dialog.Panel>
  );
}
