import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ModalGoal from './components/ModalGoal';
import ModalRecord from './components/ModalRecord';
import ModalOutcome from './components/ModalOutcome';
import { useQuery } from '@tanstack/react-query';
import { getAll } from '../lib/api';
import { formatIDR } from '../utils/formatIDR';
import { io } from 'socket.io-client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const DashboardPage = () => {
  const [goal, setGoal] = useState(false);
  const [outcome, setOutcome] = useState(false);
  const [record, setRecord] = useState(false);
  const [datax, setDatax] = useState(null);

  // React Query
  const { data } = useQuery({
    queryKey: ['getAll'],
    queryFn: getAll,
  });

  // Socket.IO realtime
  useEffect(() => {
    const socket = io('http://localhost:5000'); // ganti sesuai server mu
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('dashboardUpdate', (updatedData) => {
      setDatax(updatedData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // pilih data: datax (realtime) atau data dari query
  const dashboardData = datax || data?.data;

  const goalsData = dashboardData?.goals;
  const recordData = dashboardData?.records;
  const outcomeData = dashboardData?.outcomes;
  const totalOutcomeData = dashboardData?.totalOutcome;
  const rekapInvestData = dashboardData?.rekapInvest || [];
  console.log(dashboardData);
  return (
    <>
      {goal && (
        <ModalGoal
          open={goal}
          close={() => {
            setGoal(false);
            setDatax(false);
          }}
          data={goalsData}
        />
      )}
      {record && (
        <ModalRecord
          open={record}
          close={() => {
            setRecord(false);
            setDatax(false);
          }}
          data={recordData}
          totalOutcome={totalOutcomeData}
          goals={goalsData}
        />
      )}
      {outcome && (
        <ModalOutcome
          open={outcome}
          close={() => {
            setOutcome(false);
            setDatax(false);
          }}
          data={outcomeData}
        />
      )}

      <Layout>
        <div className="flex justify-between md:justify-evenly gap-4">
          <button
            onClick={() => setGoal(true)}
            className="bg-[#B22222] text-white px-3 py-2 rounded-lg active:bg-[#8a0e0e]"
          >
            ADD NEW GOAL
          </button>
          <button
            onClick={() => setRecord(true)}
            className="bg-[#B22222] text-white px-3 py-2 rounded-lg active:bg-[#8a0e0e]"
          >
            UPDATE RECORD
          </button>
          <button
            onClick={() => setOutcome(true)}
            className="bg-[#B22222] text-white px-3 py-2 rounded-lg active:bg-[#8a0e0e]"
          >
            UPDATE OUTCOME
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <h1 className="font-bold text-2xl md:text-3xl text-white">Financial</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goalsData?.map((item) => {
              const rekap = rekapInvestData.find(
                (r) => r.type_invest === item.title
              );
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200"
                >
                  <h1 className="text-center py-3 font-bold text-xl md:text-2xl bg-slate-100 border-b border-slate-200">
                    {item.title}
                  </h1>
                  <h1 className="font-semibold text-center py-2 border-b border-slate-200">
                    Target:{' '}
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-md inline-block">
                      {formatIDR(item?.target)}
                    </span>
                  </h1>

                  <div className="p-4 min-h-[200px] flex flex-col items-center justify-center text-slate-500">
                    {rekap ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                          data={[
                            {
                              name: rekap.type_invest,
                              Target: Number(rekap.target),
                              Terkumpul: Number(rekap.total_terkumpul),
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatIDR(value)} />
                          <Legend />
                          <Bar
                            dataKey="Target"
                            fill="#8884d8"
                            label={{
                              position: 'top',
                              formatter: (value) => formatIDR(value),
                              fill: '#000',
                              fontSize: 12,
                            }}
                          />
                          <Bar
                            dataKey="Terkumpul"
                            fill="#82ca9d"
                            label={{
                              position: 'top',
                              formatter: (value) => formatIDR(value),
                              fill: '#000',
                              fontSize: 12,
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-slate-400">Belum ada data</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default DashboardPage;
