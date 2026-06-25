import { EventSystem, Network } from '../system';
import { BufferSharingTask } from './buffer-sharing-task';

describe('BufferSharingTask', () => {
  let tasks: object[] = [];

  afterEach(() => {
    for (const task of tasks) EventSystem.unregister(task);
    tasks = [];
  });

  it('splits and reassembles a payload over the event system', (done) => {
    const identifier = `buffer-sharing-task-spec-${Date.now()}`;
    const payload = {
      title: 'large payload',
      text: 'x'.repeat(70 * 1024),
      values: [1, 2, 3],
    };
    const sendTask = BufferSharingTask.createSendTask<typeof payload>(identifier, Network.peerId);
    const receiveTask = BufferSharingTask.createReceiveTask<typeof payload>(identifier);
    tasks = [sendTask, receiveTask];
    let progressCount = 0;
    let finished = false;

    const fail = (message: string) => {
      if (finished) return;
      finished = true;
      done.fail(message);
    };

    receiveTask.onprogress = () => {
      progressCount++;
    };
    receiveTask.ontimeout = () => fail('receive task timed out');
    receiveTask.oncancel = () => fail('receive task was canceled');
    receiveTask.onfinish = (_task, data) => {
      if (finished) return;
      finished = true;
      expect(data).toEqual(payload);
      expect(progressCount).toBeGreaterThan(0);
      done();
    };
    sendTask.ontimeout = () => fail('send task timed out');
    sendTask.oncancel = () => fail('send task was canceled');

    receiveTask.start();
    sendTask.start(payload);
  });
});
