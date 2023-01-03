import { Observable } from 'rxjs';
import type { TFileProcessor } from './utils/filestreamwrapper';
import type { TLineMachineOptions, TFileLineContext } from './linemachine-common';
export declare const createRxJSLineMachine: (observableDecorator: (obs: Observable<string>) => Observable<string>, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
