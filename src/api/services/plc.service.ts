import { Socket as TcpSocket } from 'net'
import { getNextRunningNumber } from '../../services/machine/plc.service'
import { PlcCommand, PlcResponse, PLCStatusError } from '../../types/plc'
import { PlcCommandRequestBody } from '../../validators/plc.validator'
import {
  checkMachineStatus,
  createPlcCommand,
  createSimpleCommand
} from '../../services/machine/plc.manual.service'
import { HttpError } from '../../types/global'
import { logger } from '../../utils/logger'
import { DefaultEventsMap, Socket } from 'socket.io'

const TAG = 'PLC-SERVICE'

export const plcSendCommandService = async (
  plcData: PlcCommandRequestBody,
  socket: TcpSocket,
  socketClient:
    | Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    | undefined
): Promise<PlcResponse> => {
  const { floor, position, machineId } = plcData

  if (!machineId) {
    throw new HttpError(409, 'Machine id field is missing.')
  }

  try {
    const running = await getNextRunningNumber(machineId)
    const checkResult = await checkMachineStatus(socket, plcData, running, socketClient)
    return {
      message: `จัดยาเสร็จ - ชั้น: ${floor} ช่อง: ${position}`,
      plcResponse: checkResult.data
    }
  } catch (error) {
    if (error instanceof PLCStatusError) {
      throw new HttpError(500, error.message)
    }

    throw error
  }
}

export const plcSendCommandMService = async (
  plcData: PlcCommandRequestBody,
  socket: TcpSocket,
  originalCommand: string,
  socketClient:
    | Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    | undefined
): Promise<PlcResponse> => {
  const { command, floor, position, qty, machineId } = plcData

  if (!machineId) {
    throw new HttpError(409, 'Machine id field is missing.')
  }

  try {
    const running = await getNextRunningNumber(machineId)

    const message =
      command === PlcCommand.M32
        ? createPlcCommand(floor!, position!, qty!, originalCommand, running, 0)
        : createSimpleCommand(originalCommand, running)

    logger.debug(TAG, `Sending to PLC: ${message}`)

    socket.write(message)

    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new HttpError(504, 'PLC not response in 5s.'))
      }, 5000)

      socket.once('data', data => {
        const message = data.toString()
        clearTimeout(timeout)
        socketClient?.emit(String(machineId), message)
        resolve({
          message: `Command ${command?.toUpperCase()} sent successfully!`,
          plcResponse: message
        })
      })
    })
  } catch (error) {
    if (error instanceof PLCStatusError) {
      throw new HttpError(500, error.message)
    }

    throw error
  }
}
