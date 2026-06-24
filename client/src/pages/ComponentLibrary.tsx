import styled from 'styled-components'

// Components
import { Button } from '../components/Button'
import { Input, Select, Textarea } from '../components/FormFields'
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  CheckboxLabel,
  Grid,
  List,
  ListItem,
  MonoText,
  MutedHint,
  PageContainer,
  PageStack,
  PageSubtitle,
  PageTitle,
  Panel,
  SectionTitle,
  Spinner,
  StatCard,
  StatLabel,
  StatValue,
  StatusNo,
  StatusYes,
  Table,
  TableBody,
  TableHead,
  TableWrapper,
  Td,
  Text,
  Th,
} from '../components/ui'

// Styles
import { theme } from '../styles/theme'

const themeColors = [
  { name: 'background', value: theme.colors.background },
  { name: 'primary', value: theme.colors.primary },
  { name: 'secondary', value: theme.colors.secondary },
  { name: 'tertiary', value: theme.colors.tertiary },
  { name: 'muted', value: theme.colors.muted },
  { name: 'border', value: theme.colors.border },
  { name: 'success', value: theme.colors.success },
  { name: 'danger', value: theme.colors.danger },
  { name: 'accent', value: theme.colors.accent },
]

const ComponentLibrary = () => {
  return (
    <PageContainer $maxWidth="56rem">
      <PageStack $gap="2.5rem">
        <div>
          <PageTitle>DevTab Component Library</PageTitle>
          <PageSubtitle>
            Browse the styled-components design system used across the app
          </PageSubtitle>
        </div>

        <ShowcaseSection>
          <ComponentName>Theme Colors</ComponentName>
          <TokenGrid>
            {themeColors.map((color) => (
              <ColorItem key={color.name}>
                <ColorSwatch $color={color.value} />
                <ColorLabel>{color.name}</ColorLabel>
              </ColorItem>
            ))}
          </TokenGrid>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Buttons</ComponentName>
          <ShowcaseGrid>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
          </ShowcaseGrid>
          <ShowcaseGrid>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </ShowcaseGrid>
          <Button fullWidth>Full Width</Button>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Form Fields</ComponentName>
          <Grid $cols={2}>
            <Input label="Text input" placeholder="Enter text..." />
            <Select
              label="Select"
              options={[
                { value: 'a', label: 'Option A' },
                { value: 'b', label: 'Option B' },
              ]}
            />
          </Grid>
          <Input label="With error" error="This field is required" />
          <Textarea label="Textarea" rows={3} placeholder="Multi-line text..." />
          <CheckboxLabel>
            <Checkbox defaultChecked />
            Checkbox label
          </CheckboxLabel>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Alerts & Badges</ComponentName>
          <Alert>Error alert message</Alert>
          <Alert $variant="warning">Warning alert message</Alert>
          <Alert $variant="info">Info alert message</Alert>
          <ShowcaseGrid>
            <Badge $variant="draft">Draft</Badge>
            <Badge $variant="sent">Sent</Badge>
            <Badge $variant="paid">Paid</Badge>
            <StatusYes>Yes</StatusYes>
            <StatusNo>No</StatusNo>
          </ShowcaseGrid>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Cards & Stats</ComponentName>
          <Grid $cols={3}>
            <StatCard>
              <StatLabel>Total hours</StatLabel>
              <StatValue>42.5</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Billable hours</StatLabel>
              <StatValue>38.0</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Revenue</StatLabel>
              <StatValue>$4,750</StatValue>
            </StatCard>
          </Grid>
          <Card>
            <CardHeader $bordered>
              <CardTitle>Card with header</CardTitle>
              <MutedHint>Subtitle area</MutedHint>
            </CardHeader>
            <CardBody>
              <Text>Card body content goes here.</Text>
            </CardBody>
          </Card>
          <Panel>Panel — used for nested form sections</Panel>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Table</ComponentName>
          <Card>
            <TableWrapper>
              <Table>
                <TableHead>
                  <tr>
                    <Th>Project</Th>
                    <Th>Client</Th>
                    <Th $align="right">Duration</Th>
                    <Th>Billable</Th>
                  </tr>
                </TableHead>
                <TableBody>
                  <tr>
                    <Td data-emphasis="true">Website redesign</Td>
                    <Td>Acme Corp</Td>
                    <Td $align="right">
                      <MonoText>2:30:00</MonoText>
                    </Td>
                    <Td><StatusYes>Yes</StatusYes></Td>
                  </tr>
                  <tr>
                    <Td data-emphasis="true">Internal meeting</Td>
                    <Td>Acme Corp</Td>
                    <Td $align="right">
                      <MonoText>0:45:00</MonoText>
                    </Td>
                    <Td><StatusNo>No</StatusNo></Td>
                  </tr>
                </TableBody>
              </Table>
            </TableWrapper>
          </Card>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>List</ComponentName>
          <Card>
            <List>
              <ListItem>
                <Text data-emphasis="true">First list item</Text>
                <MutedHint>Detail</MutedHint>
              </ListItem>
              <ListItem>
                <Text data-emphasis="true">Second list item</Text>
                <MutedHint>Detail</MutedHint>
              </ListItem>
            </List>
          </Card>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Typography</ComponentName>
          <PageTitle>Page Title</PageTitle>
          <PageSubtitle>Page subtitle text</PageSubtitle>
          <SectionTitle>Section Title</SectionTitle>
          <Text>Default body text</Text>
          <Text $color="muted">Muted text</Text>
          <Text $color="danger">Danger text</Text>
          <MonoText>Mono: 01:23:45</MonoText>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Spinner</ComponentName>
          <ShowcaseGrid>
            <Spinner />
          </ShowcaseGrid>
        </ShowcaseSection>
      </PageStack>
    </PageContainer>
  )
}

// Style Overrides
const ShowcaseSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const ShowcaseGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
`

const ColorSwatch = styled.div<{ $color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const ColorLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 0.25rem;
`

const ColorItem = styled.div`
  text-align: center;
`

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  gap: 1rem;
`

const ComponentName = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export default ComponentLibrary
