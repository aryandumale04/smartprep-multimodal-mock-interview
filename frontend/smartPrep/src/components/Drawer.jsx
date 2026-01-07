import React from "react";
import { LuX } from "react-icons/lu";

const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      className={`fixed top-[64px] right-0 z-40
        h-[calc(100dvh-64px)]
        transition-transform duration-300
        bg-white
        w-full md:w-[40vw]
        shadow-2xl shadow-cyan-800/10
        border-l border-gray-200
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      tabIndex="-1"
      aria-labelledby="drawer-right-label"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
        <h5
          id="drawer-right-label"
          className="text-base font-semibold text-gray-900"
        >
          {title}
        </h5>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center"
        >
          <LuX className="text-lg" />
        </button>
      </div>

      {/* Body */}
      <div className="h-full overflow-y-auto px-5 py-6 bg-gray-50">
        {/* Content Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-[760px] mx-auto">
          {/* 🔑 Typography wrapper */}
          <div className="prose prose-slate max-w-none
            prose-headings:font-semibold
            prose-headings:text-gray-900
            prose-h2:mt-6
            prose-h2:mb-3
            prose-p:leading-relaxed
            prose-p:text-gray-700
            prose-li:text-gray-700
          ">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
