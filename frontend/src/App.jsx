import React, { useState } from 'react';
import { Loader2, RefreshCcw, Search, X } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const App = () => {
  const [fileName, setFileName] = useState('');
  const [teamLookup, setTeamLookup] = useState('');
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Handle searching in table data
  const filteredData = tableData.filter(row => 
    Object.values(row).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'ascending' });

    try {
      // Fetch the team lookup data
      const teamLookupResponse = await fetch(
        'https://osir3dme2h.execute-api.us-east-1.amazonaws.com/dev/team_lookup?year=1936&team=New+York+Yankees'
      );
      if (!teamLookupResponse.ok) throw new Error('Team lookup failed');
      const teamLookupData = await teamLookupResponse.json();
      setTeamLookup(teamLookupData.team);

      // Fetch the CSV data
      const response = await fetch(
        'https://osir3dme2h.execute-api.us-east-1.amazonaws.com/dev/read_csv',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_name: fileName }),
        }
      );
      if (!response.ok) throw new Error('CSV data fetch failed');
      const data = await response.json();
      setTableData(data);
      setFileName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFileName('');
    setTeamLookup('');
    setTableData([]);
    setError('');
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'ascending' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold">Baseball Data Explorer</CardTitle>
                <CardDescription>
                  Explore historical baseball data through our serverless web application
                </CardDescription>
              </div>
              {(tableData.length > 0 || teamLookup) && (
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Load Data</CardTitle>
            <CardDescription>Enter a CSV file name to load the data</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="data/ManagersHalf.csv"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Load Data
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {teamLookup && (
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{teamLookup}</p>
            </CardContent>
          </Card>
        )}

        {tableData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Table</CardTitle>
                  <CardDescription>
                    Showing {sortedData.length} of {tableData.length} records
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[250px]"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      className="absolute right-2 top-2.5 h-4 w-4 p-0"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(tableData[0]).map((header) => (
                        <TableHead 
                          key={header}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort(header)}
                        >
                          <div className="flex items-center gap-2">
                            {header}
                            {sortConfig.key === header && (
                              <span className="text-xs">
                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default App;