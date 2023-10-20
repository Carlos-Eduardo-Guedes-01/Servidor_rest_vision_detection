import './style.modules.css';
import { Link } from "react-router-dom"
function Input(){
    return(
        <>
            <div className="page_input">
                <div className='Link'>
                    <Link to='web-cam' className='link_spec'>
                        <a className='link_spec'>
                            <img src="./web_cam.png" className="Input"/><br/>
                            <div>Iniciar Com Web Cam</div>
                        </a>
                    </Link>
                </div>
            </div>
        </>
    )
}
export default Input