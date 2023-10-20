import { Outlet } from "react-router-dom"
import "./padrao.modules.css";

function Padrao(){
    return(<>

        <div className="geral">
            <div className="logo">
                <div className="image">
                    <img src="./icon_computer_vision.png" className="img"/>
                </div>
            </div>
        <div className="tit">

            <div className="Titulo">Computer Vision Web</div>
            
        </div>
        
        </div>
        <Outlet/>
    </>)
}
export default Padrao