const Accordions = (props) => {

    const { elements } = props;

    const showElement = (e) => {
      const target = e.target.closest('h2').querySelector('[data-accordion-icon]');
      const body = e.target.closest('h2').nextElementSibling;
      target.classList.toggle('rotate-180');
      body.classList.toggle('hidden');

      const allBodies = document.querySelectorAll('.accordion-block');
      allBodies.forEach((body) => {
        if(body !== e.target.closest('h2').nextElementSibling) {
          body.classList.add('hidden');
        }
      });
    }
    
    return (
      <div id="accordion-open">
        {elements.map((element, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl">
            <h2 onClick={showElement} className="cursor-pointer" >
              <button type="button" className="flex items-center cursor-pointer justify-between w-full p-5 font-bold rtl:text-right  border border-b-0 border-gray-200 rounded-t-xl gap-3" >
                <span className="flex items-center">{element.title}</span>
                <svg data-accordion-icon className={index===0?'w-3 h-3 shrink-0':'w-3 h-3 rotate-180 shrink-0'} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                </svg>
              </button>
            </h2>
            <div id={`accordion-open-body-${index}`} className={index===0?'accordion-block':'accordion-block hidden'} >
              <div className="p-5 border border-b-0 border-gray-200 ">
                {element.content}
              </div>
            </div> 
        </div>
        ))}
      </div>
    );
  };

export default Accordions;
