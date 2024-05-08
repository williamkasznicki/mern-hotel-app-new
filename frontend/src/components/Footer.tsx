const Footer = () => {
  return (
    <div className="bg-gray-200 dark:bg-slate-900 dark:text-white py-5 mt-5 duration-300">
      <div className="container mx-auto flex justify-around items-center mb-5">
        <span className="text-2xl text-slate  tracking-tight xs:mr-10 md:mr-32">
        BookEzy.com
        </span>
        <span className="text-slate md:tracking-tight flex gap-4 xs:text-sm md:text-base">
          <p>
            All content on this site is © 2024 Booking Company. Ltd. All Rights
            Reserved. Booking is affiliated with Booking Inc., a leading
            provider of online travel and associated services worldwide.
          </p>
        </span>
      </div>
      <div className="grid grid-cols-5 dark:bg-gray-100 place-items-center items-center xs:px-[2rem] lg:px-[14rem] md:px-[10rem] duration-300">
        <img src="./mongodb.svg" alt="mongo" className=" w-20" />
        <img src="./expressjs.svg" alt="mongo" className=" w-20 fill-white" />
        <img src="./react.svg" alt="react" />
        <img src="./stripe.png" alt="stripe" className=" w-16" />
        <img src="./nodejs.png" alt="nodejs" className=" w-16" />
        
      </div>
    </div>
  );
};

export default Footer;
