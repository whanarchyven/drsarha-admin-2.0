import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { cva, type VariantProps } from 'class-variance-authority';

interface StatTabProps extends VariantProps<typeof cvaRoot> {
  title: string;
  value: number;
}

const cvaRoot = cva('!p-0', {
  variants: {
    variant: {
      default: 'bg-white text-cBlack',
      success: 'bg-green-500 text-cWhite',
      warning: 'bg-yellow-500 text-cWhite',
      error: 'bg-red-500 text-cWhite',
      info: 'bg-blue-500 text-cWhite',
    },
  },
});

export const StatTab = ({ title, value, variant }: StatTabProps) => {
  return (
    <Card className={cvaRoot({ variant: variant })}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-end">
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
};
