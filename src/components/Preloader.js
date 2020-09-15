import React from "react";

function Preloader({show}) {
 
  return(
     <div className={ `preloader${(show)?" display" : "" }`}>
      <div></div>
    </div>
  );
}

export default Preloader;