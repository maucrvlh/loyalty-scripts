import { Handler } from './handler'
import { 
    Updater,
    Stats
} from './scripts'

Handler.registerScript(Updater)
Handler.registerScript(Stats)

Handler.run()