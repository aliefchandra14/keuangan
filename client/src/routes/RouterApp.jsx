import React, { lazy, Suspense } from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LoadingComponents from '../components/LoadingComponents';
import { DASHBOARD_ROUTE, NOT_FOUND } from './routerlist';
const DashboardPage = lazy(() => import('../pages/Dashboard'));

const RouterApp = () => {
  return (
    <Router>
        <Suspense fallback={<LoadingComponents/>}>
        <Routes>
            <Route path={DASHBOARD_ROUTE} element={<DashboardPage/>}/>
            <Route path={NOT_FOUND} element={<DashboardPage/>}/>
        </Routes>
        </Suspense>
    </Router>
  )
}

export default RouterApp