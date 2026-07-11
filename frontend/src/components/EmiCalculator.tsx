import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react';

interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount: number;
}

const EmiCalculator: React.FC<{ vehiclePrice: number }> = ({ vehiclePrice }) => {
  const [downPayment, setDownPayment] = useState(vehiclePrice * 0.2);
  const [loanTerm, setLoanTerm] = useState(5);
  const [interestRate, setInterestRate] = useState(4.5);

  const result: EmiResult = useMemo(() => {
    const principal = Math.max(0, vehiclePrice - downPayment);
    const monthlyRate = interestRate / 100 / 12;
    const months = loanTerm * 12;

    let monthlyEmi = 0;
    if (monthlyRate === 0) {
      monthlyEmi = months > 0 ? principal / months : 0;
    } else {
      monthlyEmi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = monthlyEmi * months;
    const totalInterest = totalPayment - principal;

    return {
      monthlyEmi: isNaN(monthlyEmi) || !isFinite(monthlyEmi) ? 0 : monthlyEmi,
      totalInterest: isNaN(totalInterest) || !isFinite(totalInterest) ? 0 : totalInterest,
      totalPayment: isNaN(totalPayment) || !isFinite(totalPayment) ? 0 : totalPayment,
      loanAmount: principal,
    };
  }, [vehiclePrice, downPayment, loanTerm, interestRate]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">EMI Finance Calculator</h3>
          <p className="text-xs text-slate-500">Estimate your monthly payments</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Down Payment</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                max={vehiclePrice}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <input
              type="range"
              min={0}
              max={vehiclePrice}
              step={500}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-slate-500 font-semibold">
              {Math.round((downPayment / vehiclePrice) * 100)}% of vehicle price ({formatCurrency(downPayment)})
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loan Term</label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                  <option key={year} value={year}>
                    {year} Year{year > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interest Rate</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
            {/* Prominent Monthly EMI Callout */}
            <div className="text-center pb-4 border-b border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Monthly Payment (EMI)</span>
              <span className="text-3xl font-extrabold text-blue-600 font-['Outfit'] block leading-none">{formatCurrency(result.monthlyEmi)}</span>
            </div>

            {/* Sub details with clear spacing */}
            <div className="space-y-3 pt-1 text-sm font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-normal">Loan Amount</span>
                <span className="text-slate-900 font-['Outfit']">{formatCurrency(result.loanAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-normal">Total Interest</span>
                <span className="text-slate-900 font-['Outfit']">{formatCurrency(result.totalInterest)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="text-slate-700">Total Payment</span>
                <span className="text-base font-extrabold text-slate-900 font-['Outfit']">{formatCurrency(result.totalPayment)}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            *This is an estimate only. Actual EMI may vary based on credit approval, documentation, and bank policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmiCalculator;
