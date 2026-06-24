import type { Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface DemoStep {
  role: 'sender' | 'avatar';
  content: string;
}

const SENDER_SCRIPT: DemoStep[] = [
  { role: 'sender', content: '我今天心情不好' },
  { role: 'avatar', content: '听起来你今天遇到了不愉快的事。愿意和我说说发生了什么吗？' },
  { role: 'sender', content: '我今天身体不舒服，妈妈晚上做好饭，我没吃，妈妈有点不高兴' },
  { role: 'avatar', content: '你身体不舒服不想吃饭很正常，妈妈的不高兴让你感到委屈了吧？当时她说了什么吗？' },
  { role: 'sender', content: '肯定委屈啊，妈妈说辛辛苦苦做好饭，还不吃' },
  { role: 'avatar', content: '妈妈辛苦做了饭，你当时不舒服又不想吃，夹在中间确实难做。后来你是怎么回她的呢？' },
  { role: 'sender', content: '我当时也很生气，就没有回答她，直接回房间了' },
  { role: 'avatar', content: '我明白了，你当时身体不舒服又面对妈妈的抱怨，心里一定很难受。现在你更希望妈妈能理解你的感受，还是希望自己平静下来？' },
  { role: 'sender', content: '希望妈妈可以理解我，我现在也很后悔' },
  { role: 'avatar', content: '你希望妈妈能理解，也为自己当时的态度后悔，这种感觉我懂。需要我帮你向妈妈解释你的心情吗？' },
  { role: 'sender', content: '是的，需要你帮我给妈妈解释一下' },
  { role: 'avatar', content: '明白了，我去跟妈妈说明情况，放心。' },
];

const RECEIVER_SCRIPT: DemoStep[] = [
  { role: 'avatar', content: '小美妈妈，小美让我转告您，她因为身体不舒服没吃晚饭，当时感到委屈和生气，但事后很后悔自己的态度。她希望您能理解她身体不适的心情。您听了这些有什么感受呢？' },
  { role: 'sender', content: '原来是这样啊，那想想我也很后悔，没有及时注意到孩子的身体' },
  { role: 'avatar', content: '听到您也感到后悔，小美一定会觉得被理解了。她其实最希望您能明白他当时身体不舒服的心情，而不是责备。您觉得以后可以怎样更好地了解她的感受呢？' },
  { role: 'sender', content: '多沟通，多体谅她' },
  { role: 'avatar', content: '您能有这样的想法，小美知道了一定会很欣慰。她只是希望身体不舒服时能得到理解和关心，而不是责备。' },
];

export function getDemoSenderScript(): DemoStep[] {
  return SENDER_SCRIPT;
}

export function getDemoReceiverScript(): DemoStep[] {
  return RECEIVER_SCRIPT;
}

export function demoStepToMessage(step: DemoStep, side: 'sender' | 'receiver'): Message {
  const role = step.role === 'avatar' ? 'avatar' : side;
  return {
    id: uuidv4(),
    role,
    content: step.content,
    timestamp: Date.now(),
  };
}
