import React, { useRef, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AddSaleForm } from "./AddSaleForm";
import { BillPrintModal } from "./BillPrintModal";

export default function AddSale({
  addSaleModalSetting,
  products,
  handlePageUpdate,
}) {
  const [sales, setSales] = useState([
    {
      productRefId: "",
      quantity: 0,
      date: new Date().toISOString().split("T")[0],
      category: "",
    },
  ]);

  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [showBill, setShowBill] = useState(false);
  const [soldItems, setSoldItems] = useState({
    date: "",
    totalIncome: 0,
    soldItems: [],
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user.role === "pharmacist" || user.role === "admin") {
      setSales((prevSales) =>
        prevSales.map((sale) => ({ ...sale, category: "drug" }))
      );
    } else if (user.role === "sunglassesSeller") {
      setSales((prevSales) =>
        prevSales.map((sale) => ({ ...sale, category: "glasses" }))
      );
    }
  }, [user.role]);

  const handleInputChange = (index, name, value) => {
    setSales((prevSales) =>
      prevSales.map((sale, i) =>
        i === index ? { ...sale, [name]: value } : sale
      )
    );
  };

  const isSaleValid = () => {
    return sales.every((sale) => sale.productRefId && sale.quantity > 0);
  };

  const sendSalesToBackend = async (sales) => {
    const response = await fetch("http://localhost:4000/api/v1/sales", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ soldItems: sales }),
    });

    if (!response.ok) {
      throw new Error("Failed to add sales");
    }

    return response.json();
  };

  const addSales = async () => {
    if (!isSaleValid()) {
      alert("Please fill all product and quantity fields correctly.");
      return;
    }

    try {
      const data = await sendSalesToBackend(sales);

      setSoldItems({
        date: new Date().toISOString().split("T")[0],
        totalIncome: data.data.receipt.totalIncome || 0,
        soldItems: data.data.receipt.soldItems || [],
      });

      setOpen(false); // Close the sale modal
      setShowBill(true); // Open the bill modal
      handlePageUpdate();
    } catch (err) {
      console.error("Error adding sales:", err);
      alert(err.message || "Something went wrong while adding sales.");
    }
  };

  const addNewProduct = () => {
    setSales((prevSales) => [
      ...prevSales,
      {
        productRefId: "",
        quantity: 0,
        date: new Date().toISOString().split("T")[0],
        category: prevSales[0]?.category || "",
      },
    ]);
  };

  const openSaleModal = () => {
    setOpen(true);
  };

  return (
    <>
      <Transition.Root show={open} as='div'>
        <Dialog
          as='div'
          className='relative z-10'
          initialFocus={cancelButtonRef}
          onClose={() => setOpen(false)}
        >
          <Transition.Child
            as='div'
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed inset-0 z-10 overflow-y-auto'>
            <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
              <Transition.Child
                as='div'
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <AddSaleForm
                  sales={sales}
                  products={products}
                  handleInputChange={handleInputChange}
                  addNewProduct={addNewProduct}
                  isSaleValid={isSaleValid}
                  addSales={addSales}
                  setOpen={setOpen}
                  cancelButtonRef={cancelButtonRef}
                  open={open}
                />
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <BillPrintModal
        showBill={showBill}
        setShowBill={setShowBill}
        soldItems={soldItems}
      />

      <button
        onClick={openSaleModal}
        className=' bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors'
      >
        Add Sale
      </button>
    </>
  );
}
