    import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './paginas/Home';
import Padrao from './paginas/Padrao';
import WebcamVideoProcessing from './paginas/Capture';
function RotasApp(){
    return(
    <>
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Padrao/>}>
                <Route index element={<Home/>}/>
                <Route path='web-cam' element={<WebcamVideoProcessing/>}/>
            </Route>
        </Routes>
    </BrowserRouter>
    </>
    )
}
export default RotasApp