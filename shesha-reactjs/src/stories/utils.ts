import { Story } from "@storybook/react";

export const addStory = <TArgs, >(template: Story<TArgs>, args: TArgs) => {
    const story = template.bind({});
    story.args = args;
    return story;
}