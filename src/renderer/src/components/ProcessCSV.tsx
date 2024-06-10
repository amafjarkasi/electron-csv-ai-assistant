import { useState, useEffect } from 'react'
import { useCopilotReadable } from '@copilotkit/react-core'

function Versions(): JSX.Element {
  const [processedCSVData, setProcessedCSVData] = useState(null)

  useCopilotReadable({
    description: 'This is the processed CSV data',
    value: processedCSVData || []
  })

  useEffect(() => {
    window.electron.ipcRenderer.on('csv-processed', (_event, data) => {
      if (data.error) {
        console.error('Error processing CSV:', data.error)
      } else {
        setProcessedCSVData(data)
      }
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('csv-processed')
    }
  }, [])

  return (
    <ul className="versions">
      <li className="app-version">
        Processed CSV Data: {processedCSVData ? Object.keys(processedCSVData).length : 0}
      </li>
    </ul>
  )
}

export default Versions
