import { useState } from 'react'
import styled from 'styled-components'
import { useForm } from 'react-hook-form'

// Hooks
import { useClients, useClientMutations } from '../hooks/useClients'
import { useProjects, useProjectMutations } from '../hooks/useProjects'

// Types
import type { Client, ProjectWithClient } from '../types/database'
import type { ClientFormData } from '../components/ClientForm'

// Components
import { ModalAddClient } from '../components/ModalAddClient'
import { Button } from '../components/Button'
import { Input } from '../components/FormFields'
import {
  ButtonRow,
  Card,
  Checkbox,
  CheckboxLabel,
  FormStack,
  PageContainer,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  Panel,
  Text,
} from '../components/ui'

// Utils
import { hasRetainerBilling } from '../lib/billing'
import { formatCurrency } from '../lib/utils'

interface ProjectFormData {
  name: string
  hourly_rate: string
  billable: boolean
}

const ProjectForm = ({
  clientId,
  project,
  onSave,
  onCancel,
}: {
  clientId: string
  project?: ProjectWithClient
  onSave: (data: { client_id: string; name: string; hourly_rate: number | null; billable: boolean }) => Promise<void>
  onCancel: () => void
}) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProjectFormData>({
    defaultValues: project
      ? {
          name: project.name,
          hourly_rate: project.hourly_rate?.toString() ?? '',
          billable: project.billable,
        }
      : { name: '', hourly_rate: '', billable: true },
  })

  const submit = handleSubmit(async (data) => {
    await onSave({
      client_id: clientId,
      name: data.name,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      billable: data.billable,
    })
  })

  return (
    <Panel as="form" onSubmit={submit} style={{ marginTop: '0.75rem' }}>
      <FormStack>
        <Input label="Project name" {...register('name', { required: true })} />
        <Input
          label="Hourly rate override ($, optional)"
          type="number"
          step="0.01"
          min="0"
          {...register('hourly_rate')}
        />
        <CheckboxLabel>
          <Checkbox {...register('billable')} />
          Billable by default
        </CheckboxLabel>
        <ButtonRow>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Project'}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </ButtonRow>
      </FormStack>
    </Panel>
  )
}

const ClientsPage = () => {
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: projects = [] } = useProjects(true)
  const clientMutations = useClientMutations()
  const projectMutations = useProjectMutations()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [addingProjectFor, setAddingProjectFor] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<ProjectWithClient | null>(null)

  const closeModal = () => {
    setModalOpen(false)
    setEditingClient(null)
  }

  const saveClient = async (data: ClientFormData) => {
    const payload = data.retainer_enabled
      ? data
      : {
          ...data,
          retainer_enabled: false,
          retainer_hours_per_month: null,
          retainer_hourly_rate: null,
          retainer_overage_rate: null,
        }

    if (editingClient) {
      await clientMutations.update.mutateAsync({ id: editingClient.id, ...payload })
    } else {
      await clientMutations.create.mutateAsync(payload)
    }
    closeModal()
  }

  const saveProject = async (data: {
    client_id: string
    name: string
    hourly_rate: number | null
    billable: boolean
  }) => {
    if (editingProject) {
      await projectMutations.update.mutateAsync({
        id: editingProject.id,
        name: data.name,
        hourly_rate: data.hourly_rate,
        billable: data.billable,
      })
      setEditingProject(null)
    } else {
      await projectMutations.create.mutateAsync(data)
      setAddingProjectFor(null)
    }
  }

  const deleteClient = async (id: string) => {
    if (!confirm('Delete this client and all associated projects?')) return
    await clientMutations.remove.mutateAsync(id)
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await projectMutations.remove.mutateAsync(id)
  }

  const archiveProject = async (project: ProjectWithClient) => {
    await projectMutations.update.mutateAsync({
      id: project.id,
      name: project.name,
      archived: !project.archived,
    })
  }

  return (
    <PageContainer $maxWidth="48rem">
      <PageStack>
        <PageHeader>
          <div>
            <PageTitle>Clients & Projects</PageTitle>
            <PageSubtitle>Manage clients and their projects</PageSubtitle>
          </div>
          <Button
            onClick={() => {
              setEditingClient(null)
              setModalOpen(true)
            }}
          >
            Add Client
          </Button>
        </PageHeader>

        <ModalAddClient
          open={modalOpen}
          client={editingClient ?? undefined}
          onSave={saveClient}
          onClose={closeModal}
        />

        {clientsLoading ? (
          <Text $color="muted">Loading...</Text>
        ) : clients.length === 0 ? (
          <Text $color="muted">No clients yet. Add your first client to get started.</Text>
        ) : (
          <PageStack>
            {clients.map((client) => {
              const clientProjects = projects.filter((p) => p.client_id === client.id)
              const isExpanded = expandedClient === client.id

              return (
                <Card key={client.id}>
                  <ClientCardHeader>
                    <ClientToggle
                      onClick={() =>
                        setExpandedClient(isExpanded ? null : client.id)
                      }
                    >
                      <ClientName>{client.name}</ClientName>
                      <ClientMeta>
                        {client.email || 'No email'} ·{' '}
                        {hasRetainerBilling(client)
                          ? `${client.retainer_hours_per_month} hr/mo retainer @ ${formatCurrency(client.retainer_hourly_rate!)}/hr, ${formatCurrency(client.retainer_overage_rate!)}/hr overage`
                          : `${formatCurrency(client.default_hourly_rate)}/hr`}
                      </ClientMeta>
                    </ClientToggle>
                    <ButtonRow>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingClient(client)
                          setModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteClient(client.id)}
                      >
                        Delete
                      </Button>
                    </ButtonRow>
                  </ClientCardHeader>

                  {isExpanded && (
                    <ProjectsSection>
                      <ProjectsHeader>
                        <ProjectsTitle>Projects</ProjectsTitle>
                        {!addingProjectFor && !editingProject && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setAddingProjectFor(client.id)}
                          >
                            Add Project
                          </Button>
                        )}
                      </ProjectsHeader>

                      {addingProjectFor === client.id && (
                        <ProjectForm
                          clientId={client.id}
                          onSave={saveProject}
                          onCancel={() => setAddingProjectFor(null)}
                        />
                      )}

                      {clientProjects.length === 0 && addingProjectFor !== client.id ? (
                        <Text $color="muted">No projects yet.</Text>
                      ) : (
                        <ProjectList>
                          {clientProjects.map((project) => (
                            <li key={project.id}>
                              {editingProject?.id === project.id ? (
                                <ProjectForm
                                  clientId={client.id}
                                  project={project}
                                  onSave={saveProject}
                                  onCancel={() => setEditingProject(null)}
                                />
                              ) : (
                                <ProjectItem>
                                  <div>
                                    <ProjectName>
                                      {project.name}
                                      {project.archived && (
                                        <ArchivedTag>(archived)</ArchivedTag>
                                      )}
                                    </ProjectName>
                                    <ProjectMeta>
                                      {project.hourly_rate != null
                                        ? formatCurrency(project.hourly_rate)
                                        : formatCurrency(client.default_hourly_rate)}{' '}
                                      /hr · {project.billable ? 'Billable' : 'Non-billable'}
                                    </ProjectMeta>
                                  </div>
                                  <ButtonRow>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingProject(project)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => archiveProject(project)}
                                    >
                                      {project.archived ? 'Restore' : 'Archive'}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteProject(project.id)}
                                    >
                                      Delete
                                    </Button>
                                  </ButtonRow>
                                </ProjectItem>
                              )}
                            </li>
                          ))}
                        </ProjectList>
                      )}
                    </ProjectsSection>
                  )}
                </Card>
              )
            })}
          </PageStack>
        )}
      </PageStack>
    </PageContainer>
  )
}

// Style Overrides
const ClientCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.25rem;
`

const ClientToggle = styled.button`
  border: none;
  background: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  color: inherit;
`

const ClientName = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const ClientMeta = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

const ProjectsSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem 1.25rem;
`

const ProjectsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`

const ProjectsTitle = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const ProjectList = styled.ul`
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const ProjectItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.75rem 1rem;
`

const ProjectName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const ArchivedTag = styled.span`
  margin-left: 0.5rem;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`

const ProjectMeta = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`

export default ClientsPage
