import { createAnimation, Animation } from '@ionic/react';

export const slideFromRightEnter = (baseEl: HTMLElement): Animation => {
  const root = baseEl.shadowRoot || baseEl;
  const backdrop = root.querySelector('ion-backdrop');
  const wrapper = root.querySelector('.modal-wrapper');

  const backdropAnimation = createAnimation()
    .addElement(backdrop!)
    .fromTo('opacity', '0', '0.4');

  const wrapperAnimation = createAnimation()
    .addElement(wrapper!)
    .fromTo('transform', 'translateX(100%)', 'translateX(0)');

  return createAnimation()
    .addAnimation([backdropAnimation, wrapperAnimation])
    .duration(300)
    .easing('cubic-bezier(0.32, 0.72, 0, 1)');
};

export const slideFromRightLeave = (baseEl: HTMLElement): Animation => {
  const root = baseEl.shadowRoot || baseEl;
  const backdrop = root.querySelector('ion-backdrop');
  const wrapper = root.querySelector('.modal-wrapper');

  const backdropAnimation = createAnimation()
    .addElement(backdrop!)
    .fromTo('opacity', '0.4', '0');

  const wrapperAnimation = createAnimation()
    .addElement(wrapper!)
    .fromTo('transform', 'translateX(0)', 'translateX(100%)');

  return createAnimation()
    .addAnimation([backdropAnimation, wrapperAnimation])
    .duration(300)
    .easing('cubic-bezier(0.32, 0.72, 0, 1)');
};
