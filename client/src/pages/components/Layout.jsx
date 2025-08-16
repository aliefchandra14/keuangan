import React from "react";
import { FcMoneyTransfer } from "react-icons/fc";
const Layout = ({ children }) => {
  return (
    <div className="bg-[#347433] min-h-screen p-10">
      <div className="bg-[#FFC107] mx-auto p-5 md:p-10 text-center shadow-md rounded-xl">
        <h1 className="font-extrabold text-2xl md:text-3xl flex items-center justify-between"><FcMoneyTransfer className="md:text-5xl text-3xl"/>MONEY MANAGEMENT<FcMoneyTransfer className="md:text-5xl text-3xl"/></h1>
      </div>
      <div className="mt-7">{children}</div>
    </div>
  );
};

export default Layout;
