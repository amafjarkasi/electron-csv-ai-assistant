/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react'
import ProcessCSV from './components/ProcessCSV'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'

function App(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleCSVFile = (): void =>
    window.electron.ipcRenderer.send('process-csv', selectedFile?.path)

  return (
    <>
      <CopilotKit runtimeUrl="http://localhost:4000">
        <CopilotSidebar
          labels={{
            title: 'CSV AI Assistant',
            initial: 'Welcome to the CSV AI Assistant'
          }}
          defaultOpen={false}
          clickOutsideToClose={false}
          instructions="This is a CSV AI Assistant. Provide insights on the data in the CSV file."
        >
          <div className="actions">
            <div className="action">
              <button onClick={() => document.getElementById('csvFileInput')?.click()}>
                Select CSV File
              </button>
              <input
                id="csvFileInput"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="action">
              <button onClick={handleCSVFile} disabled={!selectedFile}>
                Process CSV File
              </button>
            </div>
          </div>
          <div className="csv-container">
            <ProcessCSV />
          </div>
        </CopilotSidebar>
      </CopilotKit>
    </>
  )
}

export default App
