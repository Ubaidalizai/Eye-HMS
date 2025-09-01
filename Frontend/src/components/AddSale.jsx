import { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { Dialog, Transition } from '@headlessui/react';
import { BillPrintModal } from './BillPrintModal.jsx';
import { BASE_URL } from '../config';
import AuthContext from '../AuthContext.jsx';

export default function AddSale({ addSaleModalSetting, handlePageUpdate }) {
  const [sales, setSales] = useState([
    {
      productRefId: '',
      quantity: 0,
      discount: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
    },
  ]);

  const [showBill, setShowBill] = useState(false);
  const [openAddSale, setOpenAddSale] = useState(true);
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [overallDiscount, setOverallDiscount] = useState(0);

  const [soldItems, setSoldItems] = useState({
    date: '',
    totalIncome: 0,
    soldItems: [],
  });

  const authContext = useContext(AuthContext);

  // Hide overall discount input when any selected sale item is a drug
  const anyDrugSelected = sales.some((s) => s.category === 'drug');

  useEffect(() => {
    fetchProductsData();
  }, []);

  const fetchProductsData = async () => {
    try {
      const userRole = authContext?.user?.role;
      let results = [];

      // For Pharmacist: fetch only drugs
      if (userRole === 'pharmacist') {
        const pharmacyUrl = `${BASE_URL}/pharmacy?checkQuantity=true`;
        const pharmacyRes = await fetch(pharmacyUrl, {
          credentials: 'include',
          method: 'GET',
        });

        if (!pharmacyRes.ok)
          throw new Error(`Pharmacy error: ${pharmacyRes.status}`);

        const pharmacyData = await pharmacyRes.json();
        // Add category property to pharmacy products
        const pharmacyProducts = pharmacyData.data.results.map((product) => ({
          ...product,
          category: 'drug',
        }));
        results = pharmacyProducts;

        // 👓 For Receptionist: fetch all glasses products (all categories)
      } else if (userRole === 'receptionist') {
        // Fetch all categories of glasses
        const categories = ['sunglasses', 'glass', 'frame'];
        for (const cat of categories) {
          const glassesUrl = `${BASE_URL}/glasses?checkQuantity=true&category=${cat}`;
          const glassesRes = await fetch(glassesUrl, {
            credentials: 'include',
            method: 'GET',
          });

          if (glassesRes.ok) {
            const glassesData = await glassesRes.json();
            // Ensure category property is set correctly
            const glassesProducts = glassesData.data.results.map((product) => ({
              ...product,
              category: product.category || cat,
            }));
            results = results.concat(glassesProducts);
          }
        }

        // For Admin or other roles: fetch both (optional fallback)
      } else {
        // Fetch pharmacy
        const pharmacyUrl = `${BASE_URL}/pharmacy?checkQuantity=true`;
        const pharmacyRes = await fetch(pharmacyUrl, {
          credentials: 'include',
          method: 'GET',
        });
        if (pharmacyRes.ok) {
          const pharmacyData = await pharmacyRes.json();
          // Add category property to pharmacy products
          const pharmacyProducts = pharmacyData.data.results.map((product) => ({
            ...product,
            category: 'drug',
          }));
          results = results.concat(pharmacyProducts);
        }

        // Fetch all categories of glasses
        const categories = ['sunglasses', 'glass', 'frame'];
        for (const cat of categories) {
          const glassesUrl = `${BASE_URL}/glasses?checkQuantity=true&category=${cat}`;
          const glassesRes = await fetch(glassesUrl, {
            credentials: 'include',
            method: 'GET',
          });

          if (glassesRes.ok) {
            const glassesData = await glassesRes.json();
            // Ensure category property is set correctly
            const glassesProducts = glassesData.data.results.map((product) => ({
              ...product,
              category: product.category || cat,
            }));
            results = results.concat(glassesProducts);
          }
        }
      }

      setAllProducts(results);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleInputChange = (index, name, value) => {
    setSales((prevSales) =>
      prevSales.map((sale, i) =>
        i === index
          ? {
              ...sale,
              [name]: value,
              category:
                name === 'productRefId'
                  ? allProducts.find((product) => product._id === value)
                      ?.category || sale.category
                  : name === 'category'
                  ? value
                  : sale.category,
            }
          : sale
      )
    );
  };

  const isSaleValid = () => {
    return sales.every((sale) => sale.productRefId && sale.quantity > 0);
  };

  // Get filtered products based on selected category for a specific sale item
  const getFilteredProducts = (saleCategory) => {
    // If no category selected, show all products (respecting role permissions)
    if (!saleCategory) {
      return allProducts;
    }

    // If category selected, filter by that category
    const filtered = allProducts.filter((product) => {
      const matches = product.category === saleCategory;
      return matches;
    });

    return filtered;
  };

  const sendSalesToBackend = async (sales) => {
    try {
      const response = await fetch(`${BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ soldItems: sales, discount: overallDiscount }),
      });

      if (!response.ok) {
        // Attempt to parse error message from backend
        let errorMessage = 'Failed to add sales.';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text(); // Fallback to plain text
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in sendSalesToBackend:', error.message);
      throw error; // Re-throw the error to be handled by the calling function
    }
  };

  const addSales = async () => {
    if (!isSaleValid()) {
      alert('Please fill all product and quantity fields correctly.');
      return;
    }

    setIsAddButtonDisabled(true);

    try {
      // Inject category into each sale item
      const salesWithCategory = sales.map((sale) => {
        const product = allProducts.find((p) => p._id === sale.productRefId);
        return {
          ...sale,
          category: product?.category || sale.category || '',
        };
      });

      const data = await sendSalesToBackend(salesWithCategory);
      setSoldItems({
        date: data.data.date || new Date().toISOString().split('T')[0],
        discount: data.data.receipt.discount || 0,
        totalIncome: data.data.receipt.totalIncome || 0,
        soldItems: data.data.receipt.soldItems || [],
      });

      setOpenAddSale(false);
      setTimeout(() => setShowBill(true), 300);
      handlePageUpdate();
    } catch (err) {
      console.error('Error adding sales:', err.message);
      alert(err.message || 'Something went wrong while adding sales.');
    } finally {
      setIsAddButtonDisabled(false);
    }
  };

  const addNewProduct = () => {
    setSales((prevSales) => [
      ...prevSales,
      {
        productRefId: '',
        quantity: 0,
        discount: 0,
        date: new Date().toISOString().split('T')[0],
        category: prevSales[0]?.category || '',
      },
    ]);
  };

  return (
    <>
      {/* Add Sale Modal */}
      <Transition.Root show={openAddSale} as='div'>
        <Dialog as='div' className='relative z-[9999]' onClose={setOpenAddSale}>
          <Transition.Child
            as='div'
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity' />
          </Transition.Child>

          <div className='fixed inset-0 z-[9999] overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 sm:p-6'>
              <Transition.Child
                as='div'
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-md sm:max-w-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <Dialog.Title
                      as='h3'
                      className='text-lg sm:text-xl font-semibold text-gray-900 mb-4'
                    >
                      Add New Sale
                    </Dialog.Title>

                    <form>
                      {sales.map((sale, index) => (
                        <div
                          key={index}
                          className='mb-6 border-b pb-4 last:border-b-0 last:pb-0'
                        >
                          {index > 0 && (
                            <div className='text-sm font-medium text-gray-700 mb-3'>
                              Product {index + 1}
                            </div>
                          )}

                          <div className='grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2'>
                            {authContext?.user?.role !== 'pharmacist' && (
                              <div>
                                <label
                                  htmlFor={`category-${index}`}
                                  className='block text-sm font-medium text-gray-700 mb-1'
                                >
                                  Category
                                </label>
                                <select
                                  id={`category-${index}`}
                                  name='category'
                                  onChange={(e) => {
                                    handleInputChange(
                                      index,
                                      'category',
                                      e.target.value
                                    );
                                  }}
                                  value={sale.category}
                                  className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 h-10 focus:ring-blue-500 focus:border-blue-500'
                                >
                                  <option value=''>All Categories</option>
                                  {authContext?.user?.role !==
                                    'receptionist' && (
                                    <option value='drug'>Drug</option>
                                  )}
                                  {authContext?.user?.role !== 'pharmacist' && (
                                    <>
                                      <option value='sunglasses'>
                                        Sunglasses
                                      </option>
                                      <option value='glass'>Glass</option>
                                      <option value='frame'>Frame</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            )}
                            <div>
                              <label
                                htmlFor={`quantity-${index}`}
                                className='block text-sm font-medium text-gray-700 mb-1'
                              >
                                Quantity
                              </label>
                              <input
                                id={`quantity-${index}`}
                                type='number'
                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 h-10 focus:ring-blue-500 focus:border-blue-500'
                                value={sale.quantity}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    'quantity',
                                    Number.parseInt(e.target.value, 10)
                                  )
                                }
                                min='1'
                              />
                            </div>
                            <div className='grid grid-cols-1 col-span-2'>
                              <label
                                htmlFor={`product-${index}`}
                                className='block text-sm font-medium text-gray-700 mb-1'
                              >
                                Product Name
                              </label>
                              <Select
                                inputId={`product-${index}`}
                                className='basic-single'
                                classNamePrefix='select'
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    minHeight: '40px',
                                  }),
                                }}
                                value={
                                  allProducts.find(
                                    (product) =>
                                      product._id === sale.productRefId
                                  )
                                    ? {
                                        value: sale.productRefId,
                                        label: allProducts.find(
                                          (product) =>
                                            product._id === sale.productRefId
                                        ).name,
                                      }
                                    : null
                                }
                                onChange={(selectedOption) => {
                                  handleInputChange(
                                    index,
                                    'productRefId',
                                    selectedOption ? selectedOption.value : ''
                                  );
                                }}
                                options={getFilteredProducts(sale.category).map(
                                  (product) => ({
                                    value: product._id,
                                    label: `${product.name}${
                                      product.category
                                        ? ` (${product.category})`
                                        : ''
                                    }`,
                                  })
                                )}
                                placeholder={
                                  sale.category
                                    ? `Search ${sale.category} products`
                                    : 'Search or select product'
                                }
                                isClearable
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {((authContext.user.role === 'receptionist' || authContext.user.role === 'admin') && !anyDrugSelected) && (
                        <div className='mb-4'>
                          <label
                            htmlFor='overall-discount'
                            className='block text-sm font-medium text-gray-700 mb-1'
                          >
                            Overall Discount
                          </label>
                          <input
                            id='overall-discount'
                            type='number'
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full p-2.5 h-10 focus:ring-blue-500 focus:border-blue-500'
                            value={overallDiscount}
                            onChange={(e) =>
                              setOverallDiscount(
                                Number.parseInt(e.target.value, 10)
                              )
                            }
                            min='0'
                          />
                        </div>
                      )}
                      <button
                        type='button'
                        className='mt-3 inline-flex items-center justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                        onClick={addNewProduct}
                      >
                        Add Another Product
                      </button>
                    </form>
                  </div>

                  <div className='px-4 py-3 bg-gray-50 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 rounded-b-lg'>
                    <button
                      type='button'
                      className='mt-3 sm:mt-0 inline-flex justify-center px-4 py-2 h-10 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                      onClick={() => addSaleModalSetting()}
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      className={`inline-flex justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md text-white shadow-sm ${
                        isAddButtonDisabled
                          ? 'bg-gray-400 cursor-not-allowed'
                          : isSaleValid()
                          ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          : 'bg-gray-300 cursor-not-allowed'
                      } transition-colors`}
                      disabled={isAddButtonDisabled || !isSaleValid()}
                      onClick={addSales}
                    >
                      {isAddButtonDisabled ? 'Processing...' : 'Add Sale'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Bill Print Modal */}
      <BillPrintModal
        showBill={showBill}
        setShowBill={setShowBill}
        soldItems={soldItems}
      />
    </>
  );
}
