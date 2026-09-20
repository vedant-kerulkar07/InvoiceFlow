const Footer = () => {
  return (
    <footer className="border-t border-[#E8E6F2] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-5 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <p className="text-sm text-[#6B6785]">
          © {new Date().getFullYear()} InvoiceFlow. All rights reserved.
        </p>

        <p className="flex items-center gap-2 text-sm text-[#6B6785]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-teal-500"
          />
          Invoice Management System
        </p>
      </div>
    </footer>
  );
};

export default Footer;