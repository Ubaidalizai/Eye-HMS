import React from 'react';

export default function SalesForm({
  sales,
  setSales,
  products,
  addNewProduct,
}) {
  const handleInputChange = (index, name, value) => {
    setSales((prevSales) =>
      prevSales.map((sale, i) =>
        i === index
          ? {
              ...sale,
              [name]: value,
              category:
                name === 'productRefId'
                  ? products.find((product) => product._id === value)
                      ?.category || ''
                  : sale.category,
            }
          : sale
      )
    );
  };

  return (
    <form>
      {sales.map((sale, index) => (
        <div key={index} className='grid gap-4 mb-4 sm:grid-cols-2'>
          <div>
            <label
              htmlFor={`productRefId-${index}`}
              className='block mb-2 text-sm font-medium'
            >
              Product Name
            </label>
            <select
              id={`productRefId-${index}`}
              name='productRefId'
              value={sale.productRefId}
              onChange={(e) =>
                handleInputChange(index, 'productRefId', e.target.value)
              }
              className='bg-gray-50 border text-sm rounded-lg'
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
              className='block mb-2 text-sm font-medium'
            >
              Quantity
            </label>
            <input
              type='number'
              id={`quantity-${index}`}
              value={sale.quantity}
              onChange={(e) =>
                handleInputChange(index, 'quantity', parseInt(e.target.value))
              }
              className='bg-gray-50 border text-sm rounded-lg'
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
  );
}
