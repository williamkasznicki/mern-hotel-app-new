const Footer = () => {
  return (
    <div className="bg-gray-200 py-5 mt-5">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-2xl text-slate  tracking-tight">
          HotelBooking.com
        </span>
        <span className="text-slate tracking-tight flex gap-4">
          <p className="cursor-pointer">Privacy Policy</p>
          <p className="cursor-pointer">Terms of Service</p>
        </span>
      </div>
    </div>
  );
};

export default Footer;
