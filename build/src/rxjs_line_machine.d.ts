import { Observable } from 'rxjs';
import type { TFileProcessor } from './utils/file_stream_wrapper';
import type { TLineMachineOptions, TFileLineContext } from './line_machine_common';
export declare const createRxjsLineMachine: (observableDecorator: (obs: Observable<string>) => Observable<string>, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
