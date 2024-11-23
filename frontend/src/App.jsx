import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Database, TrendingUp, History } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_URL = 'https://osir3dme2h.execute-api.us-east-1.amazonaws.com/dev/';

const BATTING_STATS = [
  { value: 'HR', label: 'Home Runs' },
  { value: 'H', label: 'Hits' },
  { value: 'RBI', label: 'Runs Batted In' },
  { value: 'R', label: 'Runs' },
  { value: 'SB', label: 'Stolen Bases' },
  { value: '2B', label: 'Doubles' },
  { value: '3B', label: 'Triples' },
  { value: 'BB', label: 'Walks' },
];

const PITCHING_STATS = [
  { value: 'W', label: 'Wins' },
  { value: 'SO', label: 'Strikeouts' },
  { value: 'SV', label: 'Saves' },
  { value: 'G', label: 'Games' },
  { value: 'GS', label: 'Games Started' },
  { value: 'CG', label: 'Complete Games' },
  { value: 'SHO', label: 'Shutouts' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600 font-semibold">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const BaseballStats = () => {
  const [category, setCategory] = useState('batting');
  const [startYear, setStartYear] = useState('1900');
  const [endYear, setEndYear] = useState('2023');
  const [selectedStat, setSelectedStat] = useState('');
  const [topN, setTopN] = useState('10');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leader, setLeader] = useState(null);

  const formatChartData = (apiData) => {
    const parsedData = JSON.parse(apiData);
    return parsedData.labels.map((name, index) => ({
      name,
      value: parsedData.values[index]
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [visualizeResponse, leaderResponse] = await Promise.all([
        fetch(
          `${API_URL}/visualize_${category}_leaders?` +
          new URLSearchParams({
            start_year: startYear,
            end_year: endYear,
            stat: selectedStat,
            top_n: topN
          })
        ),
        fetch(
          `${API_URL}/period_${category}_leader?` +
          new URLSearchParams({
            start_year: startYear,
            end_year: endYear,
            stat: selectedStat
          })
        )
      ]);
      
      if (!visualizeResponse.ok) throw new Error('Failed to fetch visualization data');
      if (!leaderResponse.ok) throw new Error('Failed to fetch leader data');
      
      const visualizeData = await visualizeResponse.text();
      const leaderData = await leaderResponse.json();
      
      setChartData(formatChartData(visualizeData));
      setLeader(leaderData.output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStat) {
      setError('Please select a statistic');
      return;
    }
    fetchData();
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Modern Header with Gradient */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Baseball Analytics Hub</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-24">
              <Card className="backdrop-blur-sm bg-white/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Statistical Analysis
                  </CardTitle>
                  <CardDescription>Configure your analysis parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={category === 'batting' ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => setCategory('batting')}
                        >
                          Batting
                        </Button>
                        <Button
                          type="button"
                          variant={category === 'pitching' ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => setCategory('pitching')}
                        >
                          Pitching
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Statistic</label>
                        <Select value={selectedStat} onValueChange={setSelectedStat}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select statistic" />
                          </SelectTrigger>
                          <SelectContent>
                            {(category === 'batting' ? BATTING_STATS : PITCHING_STATS).map((stat) => (
                              <SelectItem key={stat.value} value={stat.value}>
                                {stat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Start Year</label>
                          <Input
                            type="number"
                            min="1871"
                            max="2023"
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">End Year</label>
                          <Input
                            type="number"
                            min="1871"
                            max="2023"
                            value={endYear}
                            onChange={(e) => setEndYear(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Players</label>
                        <Input
                          type="number"
                          min="1"
                          max="25"
                          value={topN}
                          onChange={(e) => setTopN(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Generate Analysis'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {leader && (
              <Card className="backdrop-blur-sm bg-white/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    <CardTitle>Record Holder</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{leader}</p>
                </CardContent>
              </Card>
            )}

            {chartData && (
              <Card className="backdrop-blur-sm bg-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Statistical Leaders</CardTitle>
                      <CardDescription>
                        {startYear === endYear 
                          ? `${selectedStat} Leaders for ${startYear}`
                          : `${selectedStat} Leaders from ${startYear} to ${endYear}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={chartData} 
                        layout="vertical" 
                        margin={{ left: 150, right: 20, top: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          tickFormatter={(value) => value.toLocaleString()}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 12 }} 
                          width={140}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="value" 
                          fill="#3b82f6"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseballStats;